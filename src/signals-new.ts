/**
 * @fileoverview Tacit-DOM Signals - A clean, Preact-like reactive system
 *
 * This is a complete rewrite that works like Preact/React:
 * - Components re-render when signals change
 * - Signals persist across re-renders
 * - Effects track dependencies automatically
 * - No complex instance management
 */

// Global state for tracking active effects
let activeEffect: (() => void) | null = null;
let isBatching = false;
const pendingUpdates = new Set<() => void>();

/**
 * A reactive signal that holds a value and notifies subscribers when it changes
 */
export type Signal<T> = {
  get(): T;
  set(value: T): void;
  update(fn: (prev: T) => T): void;
  subscribe(fn: () => void): () => void;
};

/**
 * Creates a reactive signal with an initial value
 */
export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<() => void>();

  const get = (): T => {
    // Track this signal as a dependency if we're in an effect
    if (activeEffect) {
      subscribers.add(activeEffect);
    }
    return value;
  };

  const notify = () => {
    subscribers.forEach((sub) => {
      if (sub !== activeEffect) {
        sub();
      }
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

  const update = (fn: (prev: T) => T): void => {
    set(fn(value));
  };

  const subscribe = (fn: () => void): (() => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  return { get, set, update, subscribe };
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

  const get = (): T => {
    if (dirty) {
      // Track dependencies by running the compute function
      const prevEffect = activeEffect;
      activeEffect = () => {
        dirty = true;
        // Notify subscribers that this computed is now dirty
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
export function effect(fn: () => void): () => void {
  const runEffect = () => {
    const prevEffect = activeEffect;
    activeEffect = runEffect;

    try {
      fn();
    } finally {
      activeEffect = prevEffect;
    }
  };

  // Run immediately
  runEffect();

  // Return cleanup function
  return () => {
    // Cleanup logic if needed
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
