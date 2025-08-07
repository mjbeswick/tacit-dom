type Subscriber = () => void | Promise<void>;

type Signal<T> = {
  get(): T;
  set(value: T): void;
  update(fn: (prev: T) => T): void;
  subscribe(fn: Subscriber): () => void;
};

type Computed<T> = {
  get(): T;
  subscribe(fn: Subscriber): () => void;
};

type EffectOptions = {
  name?: string;
  maxRuns?: number;
  autoDisable?: boolean;
};

type EffectContext = {
  fn: Subscriber;
  deps: Set<Set<Subscriber>>;
};

let activeEffect: EffectContext | null = null;
let isBatching = false;
const pendingSubscribers = new Set<Subscriber>();
const executionCounts: WeakMap<Subscriber, number> = new WeakMap();
const subscriberMeta = new WeakMap<
  Subscriber,
  {
    options?: EffectOptions;
    disabled?: boolean;
  }
>();
const registeredEffects = new Set<Subscriber>();
let debugMode = false;
const DEFAULT_MAX_RUNS = 100;

// Signal preservation for components
const preservedSignals = new WeakMap<object, Map<string, Signal<any>>>();
let currentComponentInstance: object | null = null;

/**
 * Enable or disable debug mode (console logs).
 */
function setDebugMode(enabled: boolean) {
  debugMode = enabled;
}

/**
 * Sets the current component instance for signal preservation.
 * This should be called by the rendering system before rendering a component.
 *
 * @param componentInstance - The component instance
 */
function setComponentInstance(componentInstance: object): void {
  currentComponentInstance = componentInstance;
}

/**
 * Clears the current component instance.
 * This should be called by the rendering system after rendering a component.
 */
function clearComponentInstance(): void {
  currentComponentInstance = null;
}

/**
 * Cleans up preserved signals for a component instance.
 * This should be called when a component is unmounted.
 *
 * @param componentInstance - The component instance to clean up
 */
function cleanupPreservedSignals(componentInstance: object): void {
  preservedSignals.delete(componentInstance);
}

/**
 * Runs a reactive effect, re-executing when its dependencies change.
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

    if (debugMode && this.options?.name) {
      console.log(`[effect:${this.options.name}] running`);
    }

    try {
      const result = this.fn();
      // Handle async effects properly
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

function signal<T>(initialValue: T, key?: string): Signal<T> {
  // If we're in a component context and a key is provided, preserve the signal
  if (currentComponentInstance && key) {
    // Get or create preserved signals map for this component
    let signalsMap = preservedSignals.get(currentComponentInstance);
    if (!signalsMap) {
      signalsMap = new Map();
      preservedSignals.set(currentComponentInstance, signalsMap);
    }

    // Get or create the signal
    let existingSignal = signalsMap.get(key);
    if (!existingSignal) {
      existingSignal = createSignal(initialValue);
      signalsMap.set(key, existingSignal);
    }

    return existingSignal;
  }

  // Otherwise, create a regular signal
  return createSignal(initialValue);
}

function createSignal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();

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

  const update = (fn: (val: T) => T): void => {
    set(fn(value));
  };

  const subscribe = (fn: Subscriber): (() => void) => {
    subscribers.add(fn);

    return () => {
      subscribers.delete(fn);
    };
  };

  return { get, set, update, subscribe };
}

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

  return {
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
  };
}

function scheduleUpdate(subscriber: Subscriber): void {
  pendingSubscribers.add(subscriber);
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

export {
  batch,
  cleanupPreservedSignals,
  clearComponentInstance,
  computed,
  effect,
  setComponentInstance,
  setDebugMode,
  signal,
};
export type { Computed, EffectContext, EffectOptions, Signal, Subscriber };
