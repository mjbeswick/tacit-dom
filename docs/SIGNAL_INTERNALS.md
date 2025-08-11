# Signal Internals: Deep Dive into Thorix's Reactive System

This document provides a comprehensive technical explanation of how Thorix's signal system works internally. It covers the implementation details, data structures, algorithms, and design decisions that power the reactive programming model.

## Table of Contents

1. [Core Data Structures](#core-data-structures)
2. [Signal Implementation](#signal-implementation)
3. [Computed Values](#computed-values)
4. [Effects System](#effects-system)
5. [Dependency Tracking](#dependency-tracking)
6. [Update Scheduling](#update-scheduling)
7. [Batching System](#batching-system)
8. [Component Signal Preservation](#component-signal-preservation)
9. [Template String Interpolation](#template-string-interpolation)
10. [Performance Optimizations](#performance-optimizations)
11. [Infinite Loop Prevention](#infinite-loop-prevention)
12. [Memory Management](#memory-management)

## Core Data Structures

### Global State Management

The signal system maintains several global data structures to manage the reactive graph:

```typescript
// Active effect tracking
let activeEffect: EffectContext | null = null;

// Batching state
let isBatching = false;

// Update scheduling
const pendingSubscribers = new Set<Subscriber>();

// Effect metadata and lifecycle management
const subscriberMeta = new WeakMap<
  Subscriber,
  {
    options?: EffectOptions;
    disabled?: boolean;
  }
>();

// Registered effects for cleanup
const registeredEffects = new Set<Subscriber>();

// Component signal preservation
const preservedSignals = new WeakMap<object, Map<string, Signal<any>>>();
let currentComponentInstance: object | null = null;

// Template string interpolation support
const reactiveInstanceToId = new WeakMap<object, string>();
const reactiveIdToInstance = new Map<string, Signal<any> | Computed<any>>();
let nextReactiveId = 1;
```

### Core Types

```typescript
type Subscriber = () => void | Promise<void>;

type Signal<T> = {
  get(): T;
  set(value: T): void;
  update(fn: (prev: T) => T): void;
  subscribe(fn: Subscriber): () => void;
  toString(): string;
};

type Computed<T> = {
  get(): T;
  subscribe(fn: Subscriber): () => void;
  toString(): string;
};

type EffectContext = {
  fn: Subscriber;
  deps: Set<Set<Subscriber>>;
};
```

## Signal Implementation

### Signal Creation

The `signal()` function creates reactive values with automatic dependency tracking:

```typescript
function signal<T>(initialValue: T, key?: string): Signal<T> {
  // Component context preservation logic
  if (currentComponentInstance && key) {
    let signalsMap = preservedSignals.get(currentComponentInstance);
    if (!signalsMap) {
      signalsMap = new Map();
      preservedSignals.set(currentComponentInstance, signalsMap);
    }

    let existingSignal = signalsMap.get(key);
    if (!existingSignal) {
      existingSignal = createSignal(initialValue);
      signalsMap.set(key, existingSignal);
    }

    return existingSignal;
  }

  return createSignal(initialValue);
}
```

### Core Signal Logic

The `createSignal()` function implements the core reactive behavior:

```typescript
function createSignal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();

  const get = (): T => {
    // Dependency tracking: if called within an effect, track this signal
    if (activeEffect) {
      subscribers.add(activeEffect.fn);
      activeEffect.deps.add(subscribers);
    }
    return value;
  };

  const set = (newValue: T): void => {
    // Only update if value actually changed (reference equality)
    if (!Object.is(newValue, value)) {
      value = newValue;

      // Schedule all subscribers for execution
      for (const sub of subscribers) {
        scheduleUpdate(sub);
      }

      // Flush updates immediately if not batching
      if (!isBatching) {
        flushUpdates();
      }
    }
  };

  const update = (fn: (val: T) => T): void => {
    set(fn(value));
  };

  const subscribe = (fn: Subscriber): (() => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  return { get, set, update, subscribe, toString: /* ... */ };
}
```

**Key Implementation Details:**

1. **Value Storage**: Each signal maintains its current value in a closure variable
2. **Subscriber Management**: Uses a `Set<Subscriber>` for O(1) add/remove operations
3. **Reference Equality**: Uses `Object.is()` for change detection to avoid unnecessary updates
4. **Immediate Flushing**: Updates are processed immediately unless batching is active

## Computed Values

### Computed Implementation

Computed values automatically track dependencies and cache results:

```typescript
function computed<T>(computeFn: () => T): Computed<T> {
  let cachedValue: T;
  let dirty = true;
  let hasBeenComputed = false;

  const subscribers = new Set<Subscriber>();
  const deps = new Set<Set<Subscriber>>();

  const invalidate = () => {
    if (!dirty) {
      dirty = true;
      // Notify subscribers that this computed is now dirty
      for (const sub of subscribers) {
        scheduleUpdate(sub);
      }

      if (!isBatching) {
        flushUpdates();
      }
    }
  };

  const compute = (): T => {
    if (dirty || !hasBeenComputed) {
      // Clean up old dependencies
      cleanup();

      // Set up new tracking context
      const effectContext: EffectContext = { fn: invalidate, deps };
      const prevActiveEffect = activeEffect;
      activeEffect = effectContext;

      try {
        cachedValue = computeFn();
        dirty = false;
        hasBeenComputed = true;
      } finally {
        activeEffect = prevActiveEffect;
      }
    }
    return cachedValue;
  };

  return {
    get() {
      // Track this computed as a dependency if we're in an effect
      if (activeEffect) {
        subscribers.add(activeEffect.fn);
        activeEffect.deps.add(subscribers);
      }
      return compute();
    },
    subscribe,
    toString: /* ... */
  };
}
```

**Key Features:**

1. **Lazy Evaluation**: Computation only happens when `get()` is called
2. **Dependency Tracking**: Automatically tracks which signals the computed depends on
3. **Caching**: Results are cached until dependencies change
4. **Invalidation**: When dependencies change, the computed marks itself as dirty
5. **Cleanup**: Old dependency relationships are cleaned up before re-computing

## Effects System

### Effect Implementation

Effects are the primary mechanism for side effects and automatic re-execution:

```typescript
function effect(fn: Subscriber, options?: EffectOptions): () => void {
  registeredEffects.add(fn);
  subscriberMeta.set(fn, { options, disabled: false });
  const reactiveEffect = new ReactiveEffect(fn, options);

  return () => {
    reactiveEffect.cleanup();
    registeredEffects.delete(fn);
    subscriberMeta.delete(fn);
  };
}

class ReactiveEffect implements EffectContext {
  deps: Set<Set<Subscriber>> = new Set();
  readonly fn: Subscriber;
  readonly options?: EffectOptions;

  constructor(fn: Subscriber, options?: EffectOptions) {
    this.fn = fn;
    this.options = options;
    this.run();
  }

  run() {
    const meta = subscriberMeta.get(this.fn);
    if (meta?.disabled) return;

    this.cleanup();
    activeEffect = this;

    try {
      const result = this.fn();
      // Handle async effects
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error(
            `Effect ${this.options?.name || 'anonymous'} failed:`,
            error,
          );
        });
      }
    } catch (error) {
      console.error(
        `Effect ${this.options?.name || 'anonymous'} failed:`,
        error,
      );
    } finally {
      activeEffect = null;
    }
  }

  cleanup() {
    for (const dep of this.deps) {
      dep.delete(this.fn);
    }
    this.deps.clear();
  }
}
```

**Effect Lifecycle:**

1. **Creation**: Effect is created and immediately executed
2. **Dependency Collection**: During execution, all accessed signals/computed values are tracked
3. **Cleanup**: Old dependencies are removed before re-execution
4. **Re-execution**: When dependencies change, the effect automatically re-runs
5. **Async Support**: Effects can return promises for async operations

## Dependency Tracking

### How Dependencies Are Tracked

The dependency tracking system works through a global `activeEffect` variable:

```typescript
// When a signal's get() method is called:
const get = (): T => {
  if (activeEffect) {
    // Add this effect as a subscriber to this signal
    subscribers.add(activeEffect.fn);
    // Add this signal's subscriber set to the effect's dependencies
    activeEffect.deps.add(subscribers);
  }
  return value;
};
```

**Dependency Graph Structure:**

```
Effect A
├── Signal X (subscribers: [Effect A, Effect B])
├── Signal Y (subscribers: [Effect A])
└── Computed Z (subscribers: [Effect A])

Effect B
├── Signal X (subscribers: [Effect A, Effect B])
└── Signal W (subscribers: [Effect B])
```

**Bidirectional Relationship:**

- **Signal → Effect**: Signal knows which effects subscribe to it
- **Effect → Signal**: Effect knows which signals it depends on

This bidirectional relationship enables:

- Efficient notification when signals change
- Proper cleanup when effects are destroyed
- Prevention of memory leaks

## Update Scheduling

### Update Flow

When a signal value changes, the following sequence occurs:

```typescript
const set = (newValue: T): void => {
  if (!Object.is(newValue, value)) {
    value = newValue;

    // 1. Schedule all subscribers for execution
    for (const sub of subscribers) {
      scheduleUpdate(sub);
    }

    // 2. Flush updates immediately if not batching
    if (!isBatching) {
      flushUpdates();
    }
  }
};

function scheduleUpdate(subscriber: Subscriber): void {
  pendingSubscribers.add(subscriber);
}
```

### Update Execution

The `flushUpdates()` function processes all pending updates:

```typescript
function flushUpdates(): void {
  if (pendingSubscribers.size === 0) return;

  const toExecute = Array.from(pendingSubscribers);
  pendingSubscribers.clear();

  // Track execution counts for infinite loop prevention
  const currentCounts = new Map<Subscriber, number>();
  for (const sub of toExecute) {
    currentCounts.set(sub, 0);
  }

  // Execute updates iteratively until no more updates are generated
  let hasMore = true;
  let iterations = 0;
  const maxIterations = 100;

  while (hasMore && iterations < maxIterations) {
    hasMore = false;
    iterations++;

    for (const sub of toExecute) {
      const count = currentCounts.get(sub) || 0;
      const isUserEffect = registeredEffects.has(sub);

      if (isUserEffect) {
        const meta = subscriberMeta.get(sub);
        if (meta?.disabled) continue;

        const maxAllowed = meta?.options?.maxRuns ?? DEFAULT_MAX_RUNS;
        if (count >= maxAllowed) {
          // Infinite loop prevention
          if (meta?.options?.autoDisable) {
            meta.disabled = true;
            if (debugMode) {
              console.warn(
                `⚠️ Infinite loop detected in effect "${meta.options.name}" after ${count} runs. (auto-disabled)`,
              );
            }
          } else {
            throw new Error(
              `⚠️ Infinite loop detected in effect "${meta.options.name}" after ${count} runs.`,
            );
          }
          continue;
        }
      }

      try {
        currentCounts.set(sub, count + 1);
        const result = sub();

        // Handle async effects
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error('Async effect failed:', error);
          });
        }

        // Check for new updates scheduled during execution
        if (pendingSubscribers.size > 0) {
          for (const newSub of pendingSubscribers) {
            if (!toExecute.includes(newSub)) {
              toExecute.push(newSub);
              currentCounts.set(newSub, 0);
            }
          }
          pendingSubscribers.clear();
          hasMore = true;
        }
      } catch (error) {
        console.error('Effect execution failed:', error);
      }
    }
  }

  if (iterations >= maxIterations) {
    throw new Error(
      'Maximum update iterations reached - possible infinite loop',
    );
  }
}
```

**Key Features:**

1. **Iterative Execution**: Updates are processed until no more updates are generated
2. **Infinite Loop Prevention**: Tracks execution counts and enforces limits
3. **Dynamic Update Collection**: New updates scheduled during execution are included
4. **Async Support**: Handles promises returned by effects
5. **Error Handling**: Catches and logs errors without breaking the update cycle

## Batching System

### Batching Implementation

The batching system prevents unnecessary effect executions during multiple signal updates:

```typescript
function batch(fn: () => void): void {
  if (isBatching) {
    // Already batching, just execute the function
    fn();
    return;
  }

  const prevBatching = isBatching;
  isBatching = true;

  try {
    fn();
  } finally {
    isBatching = prevBatching;
    // Flush all pending updates after the batch
    if (!prevBatching) {
      flushUpdates();
    }
  }
}
```

**Batching Behavior:**

```typescript
// Without batching - triggers 3 separate effect executions
signal1.set(10); // Effect runs
signal2.set(20); // Effect runs
signal3.set(30); // Effect runs

// With batching - triggers 1 effect execution
batch(() => {
  signal1.set(10);
  signal2.set(20);
  signal3.set(30);
}); // Effect runs once with all new values
```

**Use Cases:**

- **Form Updates**: Update multiple form fields simultaneously
- **Bulk Operations**: Process multiple items in a list
- **State Synchronization**: Update related state properties together

## Component Signal Preservation

### Component Context Management

Thorix preserves signals between component re-renders using a component instance system:

```typescript
// Set component context before rendering
function setComponentInstance(componentInstance: object): void {
  currentComponentInstance = componentInstance;
}

// Clear component context after rendering
function clearComponentInstance(): void {
  currentComponentInstance = null;
}

// Clean up preserved signals when component unmounts
function cleanupPreservedSignals(componentInstance: object): void {
  preservedSignals.delete(componentInstance);
}
```

**Signal Preservation Logic:**

```typescript
function signal<T>(initialValue: T, key?: string): Signal<T> {
  if (currentComponentInstance && key) {
    let signalsMap = preservedSignals.get(currentComponentInstance);
    if (!signalsMap) {
      signalsMap = new Map();
      preservedSignals.set(currentComponentInstance, signalsMap);
    }

    let existingSignal = signalsMap.get(key);
    if (!existingSignal) {
      existingSignal = createSignal(initialValue);
      signalsMap.set(key, existingSignal);
    }

    return existingSignal;
  }

  return createSignal(initialValue);
}
```

**Benefits:**

1. **State Persistence**: Component state survives re-renders
2. **Performance**: Avoids recreating signals on every render
3. **Memory Efficiency**: Uses WeakMap for automatic cleanup
4. **Key-based Organization**: Multiple signals per component with unique keys

## Template String Interpolation

### Reactive Marker System

Thorix supports reactive template strings through a marker system:

```typescript
const REACTIVE_MARKER_PREFIX = '__THORIX_RX__:';
const REACTIVE_MARKER_SUFFIX = '__';

function ensureReactiveId(instance: object, register: () => void): string {
  let id = reactiveInstanceToId.get(instance);
  if (!id) {
    id = String(nextReactiveId++);
    reactiveInstanceToId.set(instance, id);
    register();
  }
  return id;
}

// In signal toString()
toString: () => {
  const id = ensureReactiveId(signalApi as unknown as object, () => {
    const newId = reactiveInstanceToId.get(signalApi as unknown as object)!;
    reactiveIdToInstance.set(newId, signalApi);
  });
  return `${REACTIVE_MARKER_PREFIX}${id}${REACTIVE_MARKER_SUFFIX}`;
};
```

**How It Works:**

1. **Marker Generation**: Each signal/computed gets a unique ID when `toString()` is called
2. **Registry Mapping**: The ID maps back to the reactive instance
3. **DOM Binding**: DOM utilities can parse these markers and bind reactively
4. **Automatic Updates**: When signals change, bound DOM elements update automatically

**Example Usage:**

```typescript
const count = signal(0);
const message = `Count: ${count}`; // "Count: __THORIX_RX__:1__"

// DOM utilities can parse this and bind reactively
// When count changes, the DOM automatically updates
```

## Performance Optimizations

### Key Optimizations

1. **Set-based Subscribers**: O(1) add/remove operations for subscribers
2. **Reference Equality**: Only updates when values actually change
3. **Lazy Computation**: Computed values only compute when accessed
4. **Batching**: Groups multiple updates into single effect execution
5. **WeakMap Usage**: Automatic cleanup of component instances
6. **Iterative Updates**: Processes updates in batches for efficiency

### Memory Management

```typescript
// Automatic cleanup in effects
cleanup() {
  for (const dep of this.deps) {
    dep.delete(this.fn);
  }
  this.deps.clear();
}

// Component cleanup
function cleanupPreservedSignals(componentInstance: object): void {
  preservedSignals.delete(componentInstance);
}
```

## Infinite Loop Prevention

### Multi-layered Protection

1. **Execution Count Tracking**: Each effect tracks how many times it runs
2. **Configurable Limits**: Effects can set custom `maxRuns` limits
3. **Auto-disable Option**: Effects can automatically disable themselves
4. **Global Iteration Limit**: Maximum 100 update iterations per flush cycle
5. **Debug Mode**: Console warnings for suspicious patterns

### Configuration Options

```typescript
type EffectOptions = {
  name?: string; // For debugging and error messages
  maxRuns?: number; // Maximum executions before auto-disable
  autoDisable?: boolean; // Whether to auto-disable on infinite loops
};

// Usage
effect(
  () => {
    // Effect logic
  },
  {
    name: 'myEffect',
    maxRuns: 50,
    autoDisable: true,
  },
);
```

## Memory Management

### Garbage Collection Support

1. **WeakMap Usage**: Component instances don't prevent garbage collection
2. **Automatic Cleanup**: Dependencies are cleaned up when effects are destroyed
3. **Subscription Cleanup**: Manual unsubscribe functions for manual cleanup
4. **Component Lifecycle**: Signals are cleaned up when components unmount

### Best Practices

```typescript
// Always clean up effects
const cleanup = effect(() => {
  // Effect logic
});

// Later...
cleanup();

// Clean up component signals
cleanupPreservedSignals(componentInstance);

// Manual subscription cleanup
const unsubscribe = signal.subscribe(callback);
// Later...
unsubscribe();
```

## Conclusion

Thorix's signal system provides a robust, performant reactive programming model through careful attention to:

- **Efficient Data Structures**: Sets and WeakMaps for optimal performance
- **Smart Dependency Tracking**: Automatic dependency collection and cleanup
- **Update Batching**: Minimizing unnecessary effect executions
- **Memory Safety**: Proper cleanup and garbage collection support
- **Developer Experience**: Debug mode, error handling, and infinite loop prevention
- **Component Integration**: Seamless integration with component lifecycle

The system balances simplicity with power, providing a foundation for building reactive applications without the complexity of virtual DOM or complex reconciliation algorithms.
