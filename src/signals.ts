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
 *
 * @example
 * ```typescript
 * // Create a signal with an initial value
 * const count = signal(0);
 *
 * // Get the current value
 * console.log(count.get()); // 0
 *
 * // Set a new value
 * count.set(10);
 * console.log(count.get()); // 10
 *
 * // Update using a function
 * count.update(prev => prev + 1);
 * console.log(count.get()); // 11
 *
 * // Subscribe to changes
 * const unsubscribe = count.subscribe(() => {
 *   console.log('Count changed to:', count.get());
 * });
 *
 * // Check if updates are pending
 * console.log(count.pending); // false
 *
 * // Clean up subscription
 * unsubscribe();
 * ```
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
};

/**
 * Creates a reactive signal with an initial value.
 *
 * Signals are the foundation of the reactive system. They automatically track
 * dependencies when used in effects or computed values, and notify subscribers
 * when their values change.
 *
 * @param initialValue - The initial value for the signal
 * @returns A signal object with methods to get, set, and subscribe to changes
 *
 * @example
 * ```typescript
 * // Basic usage
 * const name = signal('John');
 * console.log(name.get()); // 'John'
 *
 * name.set('Jane');
 * console.log(name.get()); // 'Jane'
 *
 * // With objects
 * const user = signal({ id: 1, name: 'John' });
 * user.update(prev => ({ ...prev, name: 'Jane' }));
 * console.log(user.get()); // { id: 1, name: 'Jane' }
 *
 * // With arrays
 * const items = signal(['a', 'b', 'c']);
 * items.update(prev => [...prev, 'd']);
 * console.log(items.get()); // ['a', 'b', 'c', 'd']
 *
 * // Async updates
 * const data = signal(null);
 * data.update(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 * ```
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
 * A computed value that automatically updates when dependencies change.
 *
 * Computed values are derived from other signals and automatically recalculate
 * when their dependencies change. They provide a way to create reactive derived
 * state without manually managing subscriptions.
 *
 * @template T - The type of the computed value
 *
 * @example
 * ```typescript
 * // Create signals
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 *
 * // Create computed value
 * const fullName = computed(() => `${firstName.get()} ${lastName.get()}`);
 *
 * console.log(fullName.get()); // 'John Doe'
 *
 * // Update dependencies
 * firstName.set('Jane');
 * console.log(fullName.get()); // 'Jane Doe' (automatically updated)
 *
 * // Subscribe to changes
 * const unsubscribe = fullName.subscribe(() => {
 *   console.log('Full name changed to:', fullName.get());
 * });
 *
 * lastName.set('Smith');
 * // Output: 'Full name changed to: Jane Smith'
 *
 * unsubscribe();
 * ```
 */
export type Computed<T> = {
  /** Gets the current computed value */
  get(): T;
  /** Subscribes to changes in the computed value */
  subscribe(fn: () => void): () => void;
};

/**
 * Creates a computed value that automatically updates when dependencies change.
 *
 * Computed values are lazy and only recalculate when their value is accessed
 * and their dependencies have changed. This makes them efficient for derived
 * state that depends on multiple signals.
 *
 * @param computeFn - A function that computes the value based on other signals
 * @returns A computed value that automatically updates when dependencies change
 *
 * @example
 * ```typescript
 * // Basic computed value
 * const count = signal(0);
 * const doubled = computed(() => count.get() * 2);
 *
 * console.log(doubled.get()); // 0
 * count.set(5);
 * console.log(doubled.get()); // 10
 *
 * // Computed from multiple signals
 * const width = signal(100);
 * const height = signal(200);
 * const area = computed(() => width.get() * height.get());
 *
 * console.log(area.get()); // 20000
 * width.set(150);
 * console.log(area.get()); // 30000
 *
 * // Complex computed logic
 * const items = signal(['apple', 'banana', 'cherry']);
 * const searchTerm = signal('');
 *
 * const filteredItems = computed(() => {
 *   const term = searchTerm.get().toLowerCase();
 *   if (!term) return items.get();
 *   return items.get().filter(item =>
 *     item.toLowerCase().includes(term)
 *   );
 * });
 *
 * console.log(filteredItems.get()); // ['apple', 'banana', 'cherry']
 * searchTerm.set('a');
 * console.log(filteredItems.get()); // ['apple', 'banana']
 *
 * // Computed with conditional logic
 * const isLoggedIn = signal(false);
 * const user = signal(null);
 * const displayName = computed(() => {
 *   if (isLoggedIn.get()) {
 *     return user.get()?.name || 'Anonymous';
 *   }
 *   return 'Guest';
 * });
 * ```
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
 *
 * @example
 * ```typescript
 * // Basic effect
 * const count = signal(0);
 *
 * const dispose = effect(() => {
 *   console.log('Count is now:', count.get());
 * });
 *
 * count.set(5); // Output: 'Count is now: 5'
 * count.set(10); // Output: 'Count is now: 10'
 *
 * // Stop the effect
 * dispose();
 * count.set(15); // No output
 *
 * // Effect with cleanup
 * const user = signal('John');
 *
 * const dispose = effect(() => {
 *   const username = user.get();
 *   console.log('User changed to:', username);
 *
 *   // Return cleanup function
 *   return () => {
 *     console.log('Cleaning up for user:', username);
 *   };
 * });
 *
 * user.set('Jane');
 * // Output: 'Cleaning up for user: John'
 * // Output: 'User changed to: Jane'
 *
 * // Effect with multiple dependencies
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 *
 * effect(() => {
 *   const fullName = `${firstName.get()} ${lastName.get()}`;
 *   document.title = `Welcome, ${fullName}`;
 * });
 *
 * firstName.set('Jane'); // Title updates to "Welcome, Jane Doe"
 * lastName.set('Smith'); // Title updates to "Welcome, Jane Smith"
 *
 * // Effect for DOM manipulation
 * const isVisible = signal(true);
 * const element = document.getElementById('message');
 *
 * effect(() => {
 *   if (element) {
 *     element.style.display = isVisible.get() ? 'block' : 'none';
 *   }
 * });
 *
 * isVisible.set(false); // Element is hidden
 * isVisible.set(true);  // Element is shown
 *
 * // Effect for API calls
 * const userId = signal(1);
 *
 * effect(() => {
 *   const id = userId.get();
 *   if (id) {
 *     fetch(`/api/users/${id}`)
 *       .then(response => response.json())
 *       .then(user => {
 *         console.log('Fetched user:', user);
 *       });
 *   }
 * });
 *
 * userId.set(2); // Fetches user with ID 2
 * userId.set(3); // Fetches user with ID 3
 * ```
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
 *
 * @example
 * ```typescript
 * // Without batching - triggers effects multiple times
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 *
 * effect(() => {
 *   console.log('Name changed to:', `${firstName.get()} ${lastName.get()}`);
 * });
 *
 * firstName.set('Jane');     // Effect runs
 * lastName.set('Smith');     // Effect runs again
 *
 * // With batching - triggers effects only once
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 *
 * effect(() => {
 *   console.log('Name changed to:', `${firstName.get()} ${lastName.get()}`);
 * });
 *
 * batch(() => {
 *   firstName.set('Jane');   // No effect runs yet
 *   lastName.set('Smith');   // No effect runs yet
 *   // Effects run once here with final values
 * });
 *
 * // Batching with complex updates
 * const user = signal({ name: 'John', age: 30, email: 'john@example.com' });
 *
 * effect(() => {
 *   console.log('User updated:', user.get());
 * });
 *
 * batch(() => {
 *   user.update(prev => ({ ...prev, name: 'Jane' }));
 *   user.update(prev => ({ ...prev, age: 25 }));
 *   user.update(prev => ({ ...prev, email: 'jane@example.com' }));
 *   // Effect runs once with final user state
 * });
 *
 * // Batching in event handlers
 * const count = signal(0);
 * const isEven = signal(true);
 *
 * effect(() => {
 *   console.log(`Count: ${count.get()}, Is Even: ${isEven.get()}`);
 * });
 *
 * const handleClick = () => {
 *   batch(() => {
 *     count.update(prev => prev + 1);
 *     isEven.update(prev => (count.get() % 2) === 0);
 *   });
 *   // Effect runs once with both updated values
 * };
 *
 * // Nested batching (inner batching is ignored)
 * const x = signal(0);
 * const y = signal(0);
 *
 * effect(() => {
 *   console.log(`Coordinates: (${x.get()}, ${y.get()})`);
 * });
 *
 * batch(() => {
 *   x.set(10);
 *
 *   batch(() => {
 *     y.set(20);  // This is ignored since we're already batching
 *   });
 *
 *   x.set(15);
 * });
 * // Effect runs once with final values: (15, 20)
 * ```
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
