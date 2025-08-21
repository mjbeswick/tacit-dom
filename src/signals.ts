/**
 * @fileoverview Tacit-DOM Signals - A lightweight, reactive state management system
 *
 * This module provides a complete reactive programming model with:
 * - Signals: Mutable reactive values that automatically track dependencies
 * - Computed: Derived values that update when dependencies change
 * - Effects: Side effects that automatically re-run when dependencies change
 * - Batching: Performance optimization for multiple updates
 * - Async support: Built-in support for asynchronous operations
 * - Pending state: Track when updates are in progress
 *
 * Key Features:
 * - Zero dependencies, lightweight (~5KB gzipped)
 * - Automatic dependency tracking
 * - Infinite loop prevention
 * - Async/await support
 * - Template string interpolation
 * - Comprehensive error handling
 */

/**
 * A function that can be called to execute side effects or cleanup operations.
 * Can return void, a cleanup function, or a Promise<void> for async operations.
 */
type Subscriber = () => void | (() => void) | Promise<void>;

/**
 * A reactive signal that holds a value and automatically notifies subscribers when it changes.
 * Signals are the foundation of Tacit-DOM's reactivity system.
 */
type Signal<T> = {
  /**
   * Gets the current value of the signal.
   * If called within an effect, the effect will automatically re-run when this signal changes.
   */
  get(): T;

  /**
   * Sets a new value for the signal.
   * If the new value is different from the current value, all subscribers will be notified.
   */
  set(value: T): void;

  /**
   * Updates the signal value based on the previous value.
   * Supports both synchronous and asynchronous update functions.
   */
  update(fn: (prev: T) => T | Promise<T>): Promise<void>;

  /**
   * Subscribes to changes in the signal.
   * The subscriber function will be called whenever the signal value changes.
   */
  subscribe(fn: Subscriber): () => void;

  /**
   * Returns a string representation of the signal for debugging and template interpolation.
   */
  toString(): string;

  /**
   * A read-only reactive property that indicates whether the signal has any pending updates.
   */
  readonly pending: boolean;
};

/**
 * A computed value that automatically updates when its dependencies change.
 * Computed values are derived from other signals and computed values.
 */
type Computed<T> = {
  /**
   * Gets the current computed value.
   * If called within an effect, the effect will automatically re-run when any dependency changes.
   */
  get(): T;

  /**
   * Subscribes to changes in the computed value.
   * The subscriber function will be called whenever the computed value changes.
   */
  subscribe(fn: Subscriber): () => void;

  /**
   * Returns a string representation of the computed value for debugging and template interpolation.
   */
  toString(): string;
};

/**
 * Configuration options for effects.
 */
type EffectOptions = {
  /** A name for the effect, useful for debugging and error messages. */
  name?: string;
  /** Maximum number of times the effect can run before being automatically disabled. */
  maxRuns?: number;
  /** Whether to automatically disable the effect after it reaches maxRuns. */
  autoDisable?: boolean;
};

/**
 * Context for tracking active effects and their dependencies.
 */
type EffectContext = {
  fn: Subscriber;
  deps: Set<Set<Subscriber>>;
};

// Global state for the reactive system
let activeEffect: EffectContext | null = null;
let isBatching = false;
const pendingSubscribers = new Set<Subscriber>();
const subscriberMeta = new WeakMap<
  Subscriber,
  {
    options?: EffectOptions;
    disabled?: boolean;
  }
>();
const registeredEffects = new Set<Subscriber>();
let debugMode = false;

/**
 * Default maximum number of times an effect can run before being considered an infinite loop.
 */
const DEFAULT_MAX_RUNS = 100;

/**
 * Prefix and suffix used for reactive instance IDs in template string interpolation.
 */
const REACTIVE_MARKER_PREFIX = '__TACIT_DOM_RX__:';
const REACTIVE_MARKER_SUFFIX = '__';

const reactiveInstanceToId = new WeakMap<object, string>();
const reactiveIdToInstance = new Map<string, Signal<any> | Computed<any>>();
let nextReactiveId = 1;

/**
 * Ensures a reactive instance has a unique ID for template string interpolation.
 */
function ensureReactiveId(instance: object, register: () => void): string {
  let id = reactiveInstanceToId.get(instance);
  if (!id) {
    id = String(nextReactiveId++);
    reactiveInstanceToId.set(instance, id);
    register();
  }
  return id;
}

/**
 * Retrieves a reactive instance (signal or computed) by its ID.
 */
function getReactiveById(id: string): Signal<any> | Computed<any> | undefined {
  return reactiveIdToInstance.get(id);
}

/**
 * Enable or disable debug mode for enhanced logging and debugging.
 */
function setDebugMode(enabled: boolean) {
  debugMode = enabled;
}

/**
 * Schedules a subscriber function to be executed during the next update flush.
 */
function scheduleUpdate(subscriber: Subscriber): void {
  pendingSubscribers.add(subscriber);
}

/**
 * Executes all pending subscriber updates in a controlled manner.
 */
function flushUpdates(): void {
  if (pendingSubscribers.size === 0) return;

  const toExecute = Array.from(pendingSubscribers);
  pendingSubscribers.clear();

  // Reset execution counts for this flush cycle
  const currentCounts = new Map<Subscriber, number>();

  for (const sub of toExecute) {
    currentCounts.set(sub, 0);
  }

  // Keep executing until no more updates are generated
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
          const label = meta?.options?.name ?? '<anonymous>';
          const msg = `⚠️ Infinite loop detected in effect "${label}" after ${count} runs.`;

          if (meta?.options?.autoDisable) {
            meta.disabled = true;
            if (debugMode) {
              console.warn(msg + ' (auto-disabled)');
            }
          } else {
            if (debugMode) {
              console.warn(msg);
            } else {
              throw new Error(msg);
            }
          }
          continue;
        }
      }

      try {
        currentCounts.set(sub, count + 1);
        const result = sub();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error('Async effect failed:', error);
          });
        }

        // Check if new updates were scheduled during this execution
        if (pendingSubscribers.size > 0) {
          // Add new subscribers to our execution list
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

/**
 * Internal class that manages the execution and lifecycle of reactive effects.
 */
class ReactiveEffect implements EffectContext {
  /** Set of dependency sets that this effect depends on */
  deps: Set<Set<Subscriber>> = new Set();
  /** The original function to execute when the effect runs */
  private readonly originalFn: Subscriber;
  /** The wrapped function that gets registered as the subscriber */
  readonly fn: Subscriber;
  /** Optional configuration options for the effect */
  readonly options?: EffectOptions;
  /** Cleanup function returned by the effect (if any) */
  private cleanupFn?: () => void;

  /**
   * Creates a new reactive effect and immediately runs it.
   */
  constructor(fn: Subscriber, options?: EffectOptions) {
    this.originalFn = fn;
    this.options = options;

    // Create a wrapped function that calls run() when invoked as a subscriber
    this.fn = () => {
      this.run();
    };

    this.run();
  }

  /**
   * Executes the effect function and tracks dependencies.
   */
  run() {
    const meta = subscriberMeta.get(this.fn);
    if (meta?.disabled) return;

    // Call the previous cleanup function before running the effect again
    this.callCleanupFunction();

    // Clean up dependency tracking
    this.cleanupDependencies();

    activeEffect = this;

    if (debugMode && this.options?.name) {
      console.log(`[effect:${this.options.name}] running`);
    }

    try {
      const result = this.originalFn();

      // Handle different return types
      if (result instanceof Promise) {
        // For async effects, we can't capture cleanup directly
        result.catch((error) => {
          console.error(
            `Effect ${this.options?.name || 'anonymous'} failed:`,
            error,
          );
        });
      } else if (typeof result === 'function') {
        // Capture cleanup function
        this.cleanupFn = result;
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

  /**
   * Calls the effect's cleanup function if it exists.
   */
  private callCleanupFunction() {
    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (error) {
        console.error(
          `Cleanup function for effect ${this.options?.name || 'anonymous'} failed:`,
          error,
        );
      }
      this.cleanupFn = undefined;
    }
  }

  /**
   * Cleans up dependency tracking.
   */
  private cleanupDependencies() {
    for (const dep of this.deps) {
      dep.delete(this.fn);
    }
    this.deps.clear();
  }

  /**
   * Cleans up both the effect's cleanup function and dependency tracking.
   */
  cleanup() {
    this.callCleanupFunction();
    this.cleanupDependencies();
  }
}

/**
 * Runs a reactive effect that automatically re-executes when its dependencies change.
 * The effect function can optionally return a cleanup function that will be called
 * when the effect is re-run or when the effect is disposed.
 */
function effect(fn: Subscriber, options?: EffectOptions): () => void {
  registeredEffects.add(fn);
  subscriberMeta.set(fn, { options, disabled: false });
  const reactiveEffect = new ReactiveEffect(fn, options);

  // Return cleanup function
  return () => {
    reactiveEffect.cleanup();
    registeredEffects.delete(fn);
    subscriberMeta.delete(fn);
  };
}

/**
 * Batches multiple signal updates into a single effect flush.
 */
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

/**
 * Creates a reactive signal with an initial value.
 */
function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  let pendingUpdates = 0;
  const subscribers = new Set<Subscriber>();
  const pendingSubscribers = new Set<Subscriber>();

  const get = (): T => {
    if (activeEffect) {
      subscribers.add(activeEffect.fn);
      activeEffect.deps.add(subscribers);
    }
    return value;
  };

  const set = (newValue: T): void => {
    if (!Object.is(newValue, value)) {
      value = newValue;
      // Schedule all subscribers
      for (const sub of subscribers) {
        scheduleUpdate(sub);
      }
      // If not batching, flush immediately
      if (!isBatching) {
        flushUpdates();
      }
    }
  };

  const update = async (fn: (val: T) => T | Promise<T>): Promise<void> => {
    const wasPending = pendingUpdates > 0;
    pendingUpdates++;

    // Notify pending subscribers if this is the first pending update
    if (!wasPending) {
      for (const sub of pendingSubscribers) {
        scheduleUpdate(sub);
      }
      if (!isBatching) {
        flushUpdates();
      }
    }

    try {
      const result = fn(value);
      if (result instanceof Promise) {
        const newValue = await result;
        set(newValue);
      } else {
        set(result);
      }
    } finally {
      pendingUpdates--;

      // Notify pending subscribers if this was the last pending update
      if (pendingUpdates === 0) {
        for (const sub of pendingSubscribers) {
          scheduleUpdate(sub);
        }
        if (!isBatching) {
          flushUpdates();
        }
      }
    }
  };

  const subscribe = (fn: Subscriber): (() => void) => {
    subscribers.add(fn);

    return () => {
      subscribers.delete(fn);
    };
  };

  const getPending = (): boolean => {
    if (activeEffect) {
      pendingSubscribers.add(activeEffect.fn);
      activeEffect.deps.add(pendingSubscribers);
    }
    return pendingUpdates > 0;
  };

  const signalApi: Signal<T> = {
    get,
    set,
    update,
    subscribe,
    get pending() {
      return getPending();
    },
    toString: () => {
      // Expose a stable marker that DOM can parse and bind reactively when
      // this signal is used inside a template string.
      const id = ensureReactiveId(signalApi as unknown as object, () => {
        const newId = reactiveInstanceToId.get(signalApi as unknown as object)!;
        reactiveIdToInstance.set(newId, signalApi);
      });
      return `${REACTIVE_MARKER_PREFIX}${id}${REACTIVE_MARKER_SUFFIX}`;
    },
  };

  return signalApi;
}

/**
 * Creates a computed value that automatically updates when its dependencies change.
 */
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
      // If not batching, flush immediately
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

  const cleanup = () => {
    for (const dep of deps) {
      dep.delete(invalidate);
    }
    deps.clear();
  };

  const computedApi: Computed<T> = {
    get() {
      // Track this computed as a dependency if we're in an effect
      if (activeEffect) {
        subscribers.add(activeEffect.fn);
        activeEffect.deps.add(subscribers);
      }
      return compute();
    },
    subscribe(fn: Subscriber): () => void {
      subscribers.add(fn);

      return () => {
        subscribers.delete(fn);
      };
    },
    toString() {
      const id = ensureReactiveId(computedApi as unknown as object, () => {
        const newId = reactiveInstanceToId.get(
          computedApi as unknown as object,
        )!;
        reactiveIdToInstance.set(newId, computedApi as unknown as Computed<T>);
      });
      return `${REACTIVE_MARKER_PREFIX}${id}${REACTIVE_MARKER_SUFFIX}`;
    },
  };

  return computedApi;
}

export {
  REACTIVE_MARKER_PREFIX,
  REACTIVE_MARKER_SUFFIX,
  batch,
  computed,
  effect,
  getReactiveById,
  setDebugMode,
  signal,
};
export type { Computed, EffectContext, EffectOptions, Signal, Subscriber };
