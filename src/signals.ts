/**
 * @fileoverview Tacit-DOM Signals - A clean, Preact-like reactive system
 *
 * This is a complete rewrite that works like Preact/React:
 * - Components re-render when signals change
 * - Signals persist across re-renders
 * - Effects track dependencies automatically
 * - No complex instance management
 */

// Global state for tracking active effects and batching
let activeEffect: (() => void) | null = null;
let isBatching = false;
const pendingUpdates = new Set<() => void>();

/**
 * A reactive signal that holds a value and notifies subscribers when it changes.
 *
 * Signals are the core building blocks of the reactive system. They can hold any
 * type of value and automatically track dependencies when used in effects or
 * computed values.
 *
 * @template T - The type of value held by the signal
 */
export type Signal<T> = {
  /** Gets the current value of the signal */
  get(): T;
  /** Sets the signal to a new value */
  set(value: T): void;
  /** Updates the signal using a function that receives the previous value */
  update(fn: (prev: T) => T | Promise<T>): Promise<void>;
  /** Subscribes to changes in the signal value */
  subscribe(fn: () => void): () => void;
  /** Whether the signal is currently being updated */
  readonly pending: boolean;
  /** The current value of the signal (getter) */
  readonly value: T;
};

/**
 * A read-only signal that can only be read and subscribed to, not modified.
 *
 * Read-only signals are useful for computed values and other derived state
 * that should not be directly modified by consumers.
 *
 * @template T - The type of value held by the signal
 */
export type ReadonlySignal<T> = {
  /** Gets the current value of the signal */
  get(): T;
  /** Subscribes to changes in the signal value */
  subscribe(fn: () => void): () => void;
  /** The current value of the signal (getter) */
  readonly value: T;
};

/**
 * Creates a reactive signal with an initial value.
 */
export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  let pending = false;
  let pendingUpdateCount = 0;
  const subscribers = new Set<() => void>();
  const dependencies = new Set<() => void>();

  const get = (): T => {
    // Track this signal as a dependency if we're in an effect or computed
    if (activeEffect) {
      dependencies.add(activeEffect);
    }
    return value;
  };

  const notify = () => {
    // Notify all subscribers
    subscribers.forEach((sub) => {
      if (sub !== activeEffect) {
        sub();
      }
    });

    // Also notify dependencies (effects and computed values)
    dependencies.forEach((dep) => {
      dep();
    });
  };

  const set = (newValue: T): void => {
    if (!Object.is(value, newValue)) {
      value = newValue;
      // Schedule updates
      pendingUpdates.add(notify);
      if (!isBatching) {
        flushUpdates();
      }
    }
  };

  const update = async (fn: (prev: T) => T | Promise<T>): Promise<void> => {
    try {
      pendingUpdateCount++;
      pending = true;
      // Notify subscribers that pending state changed
      pendingUpdates.add(notify);
      if (!isBatching) {
        flushUpdates();
      }

      const result = fn(value); // value is the previous value
      if (result instanceof Promise) {
        const newValue = await result;
        // Update the signal with the resolved value
        set(newValue);
      } else {
        // Update the signal with the sync value
        set(result);
      }
    } catch (error) {
      // Ignore failed updates, just log them
      console.warn('Signal update failed:', error);
    } finally {
      pendingUpdateCount--;
      if (pendingUpdateCount === 0) {
        pending = false;
        // Notify subscribers that pending state changed
        pendingUpdates.add(notify);
        if (!isBatching) {
          flushUpdates();
        }
      }
    }
  };

  const subscribe = (fn: () => void): (() => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  // Create the signal object with proper pending property access
  const signalObj = {
    get,
    set,
    update,
    subscribe,
    get pending() {
      return pending;
    },
    get value() {
      return value; // Direct access without dependency tracking
    },
  };

  return signalObj as Signal<T>;
}

/**
 * A computed value that automatically updates when dependencies change.
 *
 * Computed values are derived from other signals and automatically recalculate
 * when their dependencies change. They provide a way to create reactive derived
 * state without manually managing subscriptions.
 *
 * @template T - The type of the computed value
 */

/**
 * Creates a read-only signal that automatically updates when dependencies change.
 *
 * Computed values are lazy and only recalculate when their value is accessed
 * and their dependencies have changed. This makes them efficient for derived
 * state that depends on multiple signals. They are read-only and cannot be
 * directly set or updated.
 *
 * @param computeFn - A function that computes the value based on other signals
 * @returns A read-only signal that automatically updates when dependencies change
 */
export function computed<T>(computeFn: () => T): ReadonlySignal<T> {
  let cachedValue: T;
  let dirty = true;
  let isComputing = false;
  const subscribers = new Set<() => void>();
  const dependencies = new Set<() => void>();

  const get = (): T => {
    if (dirty && !isComputing) {
      isComputing = true;

      // Track dependencies by running the compute function
      const prevEffect = activeEffect;
      activeEffect = () => {
        // Mark as dirty when dependencies change
        dirty = true;
        // Store the current activeEffect to exclude it from notifications
        const currentActiveEffect = activeEffect;
        // Schedule notification of subscribers and dependent effects
        Promise.resolve().then(() => {
          if (!dirty) return;
          // Notify subscribers (e.g., computed subscribers)
          subscribers.forEach((sub) => {
            if (sub !== currentActiveEffect) {
              sub();
            }
          });
          // Notify dependent effects/components to re-run
          dependencies.forEach((dep) => {
            if (dep !== currentActiveEffect) {
              dep();
            }
          });
        });
      };

      try {
        cachedValue = computeFn();
      } finally {
        activeEffect = prevEffect;
        isComputing = false;
      }

      dirty = false;
    }

    // Track this computed value as a dependency if we're in an effect
    if (activeEffect) {
      dependencies.add(activeEffect);
    }

    return cachedValue;
  };

  const subscribe = (fn: () => void): (() => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  // Return a read-only signal
  return {
    get,
    subscribe,
    get value() {
      // Return the cached value directly without any side effects
      return cachedValue;
    },
  };
}

/**
 * Runs a side effect that automatically re-executes when dependencies change.
 *
 * Effects are used to perform side effects (like DOM updates, API calls, or
 * logging) that need to happen when signals change. They automatically track
 * which signals they depend on and re-run whenever those signals change.
 *
 * Effects can return a cleanup function that will be called before the effect
 * runs again or when the effect is disposed.
 *
 * @param fn - A function that performs the side effect and optionally returns a cleanup function
 * @returns A function to dispose of the effect and stop it from running
 */
export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: (() => void) | void;
  let disposed = false;

  const runEffect = () => {
    if (disposed) return;

    // Call previous cleanup before re-running
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }

    const prevEffect = activeEffect;
    activeEffect = runEffect;

    try {
      cleanup = fn();
    } finally {
      activeEffect = prevEffect;
    }
  };

  // Run immediately
  runEffect();

  // Return disposal function
  return () => {
    disposed = true;
    // Call cleanup one final time
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }
  };
}

/**
 * Batches multiple signal updates into a single effect flush.
 *
 * Batching allows you to perform multiple signal updates without triggering
 * effects after each individual update. Instead, all effects are batched
 * together and run once at the end, improving performance and preventing
 * unnecessary intermediate updates.
 *
 * @param fn - A function that performs multiple signal updates
 */
export function batch(fn: () => void): void {
  if (isBatching) {
    fn();
    return;
  }

  isBatching = true;
  try {
    fn();
  } finally {
    isBatching = false;
    flushUpdates();
  }
}

/**
 * Flushes all pending updates.
 *
 * This function processes all queued signal updates and triggers their
 * associated effects. It's called automatically by the batching system
 * and typically doesn't need to be called manually.
 *
 * @internal
 */
function flushUpdates(): void {
  if (pendingUpdates.size === 0) return;

  const updates = Array.from(pendingUpdates);
  pendingUpdates.clear();

  updates.forEach((update) => update());
}
