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

export type Signal<T> = {
  get(): T;
  set(value: T): void;
  update(fn: (prev: T) => T | Promise<T>): Promise<void>;
  subscribe(fn: () => void): () => void;
  readonly pending: boolean;
};

/**
 * Creates a reactive signal with an initial value
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
    // We need to notify ALL dependencies, including the active effect
    // This is crucial for computed values to work properly
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

      const result = fn(value);
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
  };

  return signalObj as Signal<T>;
}

/**
 * A computed value that automatically updates when dependencies change
 */
export type Computed<T> = {
  get(): T;
  subscribe(fn: () => void): () => void;
};

/**
 * Creates a computed value that automatically updates when dependencies change
 */
export function computed<T>(computeFn: () => T): Computed<T> {
  let cachedValue: T;
  let dirty = true;
  const subscribers = new Set<() => void>();
  const signalDependencies = new Set<() => void>();

  const get = (): T => {
    if (dirty) {
      // Clear previous signal dependencies
      signalDependencies.clear();

      // Track dependencies by running the compute function
      const prevEffect = activeEffect;
      activeEffect = () => {
        // This will be called by signals when they change
        // Mark this computed as dirty
        dirty = true;
        // Notify subscribers
        subscribers.forEach((sub) => {
          if (sub !== activeEffect) {
            sub();
          }
        });
      };

      try {
        cachedValue = computeFn();
      } finally {
        activeEffect = prevEffect;
      }

      dirty = false;
    }
    return cachedValue;
  };

  const subscribe = (fn: () => void): (() => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  return { get, subscribe };
}

/**
 * Runs a side effect that automatically re-executes when dependencies change
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
 * Batches multiple signal updates into a single effect flush
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
 * Flushes all pending updates
 */
function flushUpdates(): void {
  if (pendingUpdates.size === 0) return;

  const updates = Array.from(pendingUpdates);
  pendingUpdates.clear();

  updates.forEach((update) => update());
}
