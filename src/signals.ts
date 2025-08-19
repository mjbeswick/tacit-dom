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
 *
 * @example
 * ```typescript
 * import { signal, computed, effect, batch } from 'tacit-dom';
 *
 * // Create reactive state
 * const count = signal(0);
 * const doubled = computed(() => count.get() * 2);
 *
 * // Set up side effects
 * effect(() => {
 *   console.log(`Count: ${count.get()}, Doubled: ${doubled.get()}`);
 * });
 *
 * // Update state
 * count.set(5); // Automatically logs: "Count: 5, Doubled: 10"
 *
 * // Batch multiple updates
 * batch(() => {
 *   count.set(10);
 *   count.set(15);
 * }); // Effect runs only once
 * ```
 *
 * @see {@link signal} - Create reactive values
 * @see {@link computed} - Create derived values
 * @see {@link effect} - Create side effects
 * @see {@link batch} - Batch multiple updates
 */

/**
 * A function that can be called to execute side effects or cleanup operations.
 * Can return void or a Promise<void> for async operations.
 */
type Subscriber = () => void | Promise<void>;

/**
 * A reactive signal that holds a value and automatically notifies subscribers when it changes.
 * Signals are the foundation of Tacit-DOM's reactivity system.
 *
 * @template T - The type of value stored in the signal
 *
 * @example
 * ```typescript
 * const count = signal(0);
 * count.set(5);
 * console.log(count.get()); // 5
 *
 * // Subscribe to changes
 * const unsubscribe = count.subscribe(() => {
 *   console.log('Count changed to:', count.get());
 * });
 *
 * // Async update
 * await count.update(async (prev) => {
 *   const result = await fetch('/api/increment', {
 *     method: 'POST',
 *     body: JSON.stringify({ value: prev })
 *   });
 *   return (await result.json()).newValue;
 * });
 *
 * // Check if updates are in progress
 * if (count.pending) {
 *   console.log('Signal is being updated...');
 * }
 * ```
 */
type Signal<T> = {
  /**
   * Gets the current value of the signal.
   * If called within an effect, the effect will automatically re-run when this signal changes.
   *
   * @returns The current value of the signal
   */
  get(): T;

  /**
   * Sets a new value for the signal.
   * If the new value is different from the current value, all subscribers will be notified.
   *
   * @param value - The new value to set
   */
  set(value: T): void;

  /**
   * Updates the signal value based on the previous value.
   * Supports both synchronous and asynchronous update functions.
   *
   * @param fn - Function that receives the previous value and returns the new value or a Promise resolving to the new value
   * @returns Promise that resolves when the update is complete
   *
   * @example
   * ```typescript
   * // Synchronous update
   * await count.update((prev) => prev + 1);
   *
   * // Asynchronous update
   * await count.update(async (prev) => {
   *   const result = await fetch('/api/increment', {
   *     method: 'POST',
   *     body: JSON.stringify({ value: prev })
   *   });
   *   return (await result.json()).newValue;
   * });
   * ```
   */
  update(fn: (prev: T) => T | Promise<T>): Promise<void>;

  /**
   * Subscribes to changes in the signal.
   * The subscriber function will be called whenever the signal value changes.
   *
   * @param fn - Function to call when the signal changes
   * @returns Unsubscribe function to stop listening for changes
   *
   * @example
   * ```typescript
   * const unsubscribe = count.subscribe(() => {
   *   console.log('Count changed to:', count.get());
   * });
   *
   * // Later, stop listening
   * unsubscribe();
   * ```
   */
  subscribe(fn: Subscriber): () => void;

  /**
   * Returns a string representation of the signal for debugging and template interpolation.
   *
   * @returns A unique identifier string for the signal
   */
  toString(): string;

  /**
   * A read-only reactive property that indicates whether the signal has any pending updates.
   * This property automatically triggers effects and component re-renders when the pending state changes.
   *
   * @example
   * ```typescript
   * // Use in UI components
   * button({
   *   disabled: count.pending,
   *   onclick: () => count.update(async (prev) => prev + 1)
   * }, count.pending ? '⏳ Updating...' : 'Increment');
   * ```
   */
  readonly pending: boolean;
};

/**
 * A computed value that automatically updates when its dependencies change.
 * Computed values are derived from other signals and computed values.
 *
 * @template T - The type of computed value
 *
 * @example
 * ```typescript
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 *
 * const fullName = computed(() => {
 *   return firstName.get() + ' ' + lastName.get();
 * });
 *
 * console.log(fullName.get()); // "John Doe"
 *
 * firstName.set('Jane');
 * console.log(fullName.get()); // "Jane Doe"
 *
 * // Subscribe to changes
 * const unsubscribe = fullName.subscribe(() => {
 *   console.log('Full name changed to:', fullName.get());
 * });
 * ```
 */
type Computed<T> = {
  /**
   * Gets the current computed value.
   * If called within an effect, the effect will automatically re-run when any dependency changes.
   * The value is cached and only recomputed when necessary.
   *
   * @returns The current computed value
   */
  get(): T;

  /**
   * Subscribes to changes in the computed value.
   * The subscriber function will be called whenever the computed value changes.
   *
   * @param fn - Function to call when the computed value changes
   * @returns Unsubscribe function to stop listening for changes
   *
   * @example
   * ```typescript
   * const unsubscribe = fullName.subscribe(() => {
   *   console.log('Full name changed to:', fullName.get());
   * });
   *
   * // Later, stop listening
   * unsubscribe();
   * ```
   */
  subscribe(fn: Subscriber): () => void;

  /**
   * Returns a string representation of the computed value for debugging and template interpolation.
   *
   * @returns A unique identifier string for the computed value
   */
  toString(): string;
};

/**
 * Configuration options for effects.
 *
 * @example
 * ```typescript
 * effect(() => {
 *   console.log('This effect has options');
 * }, {
 *   name: 'MyEffect',
 *   maxRuns: 10,
 *   autoDisable: true
 * });
 * ```
 */
type EffectOptions = {
  /**
   * A name for the effect, useful for debugging and error messages.
   *
   * @example
   * ```typescript
   * effect(() => {
   *   // effect logic
   * }, { name: 'UserProfileEffect' });
   * ```
   */
  name?: string;

  /**
   * Maximum number of times the effect can run before being automatically disabled.
   * Useful for preventing infinite loops.
   *
   * @default 100
   *
   * @example
   * ```typescript
   * effect(() => {
   *   // effect logic
   * }, { maxRuns: 5 });
   * ```
   */
  maxRuns?: number;

  /**
   * Whether to automatically disable the effect after it reaches maxRuns.
   * If false, the effect will throw an error instead.
   *
   * @default false
   *
   * @example
   * ```typescript
   * effect(() => {
   *   // effect logic
   * }, { maxRuns: 10, autoDisable: true });
   * ```
   */
  autoDisable?: boolean;
};

type EffectContext = {
  fn: Subscriber;
  deps: Set<Set<Subscriber>>;
};

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
 * This is used when no maxRuns option is specified in EffectOptions.
 *
 * @example
 * ```typescript
 * // By default, effects can run up to 100 times
 * effect(() => {
 *   // This effect will be disabled after 100 runs
 *   console.log('Running...');
 * });
 *
 * // You can override this with options
 * effect(() => {
 *   console.log('Running...');
 * }, { maxRuns: 50 }); // Will be disabled after 50 runs
 * ```
 */
const DEFAULT_MAX_RUNS = 100;

/**
 * Prefix used for reactive instance IDs in template string interpolation.
 * This allows DOM elements to identify and bind to reactive values.
 *
 * @example
 * ```typescript
 * const count = signal(0);
 * const id = count.toString(); // Returns "__TACIT_DOM_RX__:1__"
 *
 * // In DOM templates, this ID can be used to bind the reactive value
 * const element = div(`Count: ${count}`); // Automatically reactive
 * ```
 */
const REACTIVE_MARKER_PREFIX = '__TACIT_DOM_RX__:';

/**
 * Suffix used for reactive instance IDs in template string interpolation.
 * This allows DOM elements to identify and bind to reactive values.
 *
 * @example
 * ```typescript
 * const count = signal(0);
 * const id = count.toString(); // Returns "__TACIT_DOM_RX__:1__"
 *
 * // In DOM templates, this ID can be used to bind the reactive value
 * const element = div(`Count: ${count}`); // Automatically reactive
 * ```
 */
const REACTIVE_MARKER_SUFFIX = '__';

const reactiveInstanceToId = new WeakMap<object, string>();
const reactiveIdToInstance = new Map<string, Signal<any> | Computed<any>>();
let nextReactiveId = 1;

/**
 * Ensures a reactive instance has a unique ID for template string interpolation.
 * This function is used internally by the toString() method to generate stable IDs.
 *
 * @param instance - The reactive instance (signal or computed) to ensure has an ID
 * @param register - Callback function to register the instance in the global registry
 * @returns A unique string ID for the instance
 *
 * @example
 * ```typescript
 * // This is used internally by toString()
 * const count = signal(0);
 * const id = count.toString(); // Internally calls ensureReactiveId
 *
 * // The ID is stable and unique
 * console.log(id); // "__TACIT_DOM_RX__:1__"
 * console.log(count.toString()); // Same ID: "__TACIT_DOM_RX__:1__"
 * ```
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
 * This is primarily used for template string interpolation and debugging purposes.
 *
 * @param id - The reactive ID string (obtained from toString() method)
 * @returns The reactive instance if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const count = signal(0);
 * const id = count.toString(); // Returns something like "__TACIT_DOM_RX__:1__"
 *
 * const retrieved = getReactiveById(id);
 * console.log(retrieved === count); // true
 * ```
 *
 * @example
 * ```typescript
 * // For debugging purposes
 * const user = signal({ name: 'John', age: 30 });
 * const userId = user.toString();
 *
 * // Later, you can retrieve the instance
 * const retrievedUser = getReactiveById(userId);
 * if (retrievedUser) {
 *   console.log('Retrieved user:', retrievedUser.get());
 * }
 * ```
 */
function getReactiveById(id: string): Signal<any> | Computed<any> | undefined {
  return reactiveIdToInstance.get(id);
}

/**
 * Enable or disable debug mode for enhanced logging and debugging.
 * When enabled, provides additional console output for effects, updates, and error handling.
 *
 * @param enabled - Whether to enable debug mode
 *
 * @example
 * ```typescript
 * // Enable debug mode for development
 * setDebugMode(true);
 *
 * const count = signal(0);
 *
 * effect(() => {
 *   console.log('Count changed to:', count.get());
 * }, { name: 'CounterEffect' });
 *
 * // With debug mode enabled, you'll see:
 * // [effect:CounterEffect] running
 * // Count changed to: 0
 *
 * count.set(5);
 * // [effect:CounterEffect] running
 * // Count changed to: 5
 * ```
 *
 * @example
 * ```typescript
 * // Disable debug mode for production
 * setDebugMode(false);
 *
 * // Now effects run silently without debug logging
 * ```
 */
function setDebugMode(enabled: boolean) {
  debugMode = enabled;
}

/**
 * Runs a reactive effect that automatically re-executes when its dependencies change.
 * Effects are the primary way to create side effects in Tacit-DOM applications.
 *
 * @param fn - Function to execute that can access reactive values
 * @param options - Optional configuration for the effect
 * @returns A cleanup function to stop the effect and free resources
 *
 * @example
 * ```typescript
 * // Basic effect
 * const count = signal(0);
 *
 * effect(() => {
 *   console.log('Count is now:', count.get());
 * });
 *
 * count.set(5); // Logs: "Count is now: 5"
 * count.set(10); // Logs: "Count is now: 10"
 * ```
 *
 * @example
 * ```typescript
 * // Effect with cleanup function
 * const isVisible = signal(true);
 *
 * const cleanup = effect(() => {
 *   if (isVisible.get()) {
 *     console.log('Component is visible');
 *
 *     // Return cleanup function
 *     return () => {
 *       console.log('Component is no longer visible, cleaning up...');
 *     };
 *   }
 * });
 *
 * isVisible.set(false); // Logs cleanup message
 * ```
 *
 * @example
 * ```typescript
 * // Effect with options
 * const user = signal({ name: 'John', age: 30 });
 *
 * effect(() => {
 *   console.log('User updated:', user.get());
 * }, {
 *   name: 'UserLogger',
 *   maxRuns: 50,
 *   autoDisable: true
 * });
 *
 * user.set({ name: 'John', age: 31 });
 * user.set({ name: 'Jane', age: 25 });
 * ```
 *
 * @example
 * ```typescript
 * // Effect for DOM manipulation
 * const message = signal('Hello World');
 * const element = document.getElementById('message');
 *
 * effect(() => {
 *   if (element) {
 *     element.textContent = message.get();
 *   }
 * });
 *
 * // Update message and DOM updates automatically
 * message.set('Hello Tacit-DOM!');
 * ```
 *
 * @example
 * ```typescript
 * // Effect with multiple dependencies
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 *
 * effect(() => {
 *   const fullName = firstName.get() + ' ' + lastName.get();
 *   console.log('Full name changed to:', fullName);
 * });
 *
 * firstName.set('Jane'); // Logs: "Full name changed to: Jane Doe"
 * lastName.set('Smith'); // Logs: "Full name changed to: Jane Smith"
 * ```
 *
 * @example
 * ```typescript
 * // Effect for localStorage persistence
 * const userPreferences = signal({
 *   theme: 'light',
 *   language: 'en',
 *   notifications: true
 * });
 *
 * effect(() => {
 *   const prefs = userPreferences.get();
 *   localStorage.setItem('userPreferences', JSON.stringify(prefs));
 *   console.log('Preferences saved to localStorage');
 * });
 *
 * // Any change automatically persists
 * userPreferences.set({ ...userPreferences.get(), theme: 'dark' });
 * ```
 *
 * @example
 * ```typescript
 * // Effect with cleanup for event listeners
 * const isOnline = signal(navigator.onLine);
 *
 * const cleanup = effect(() => {
 *   const online = isOnline.get();
 *
 *   if (online) {
 *     console.log('User is online');
 *
 *     // Set up online event listeners
 *     const handleOnline = () => isOnline.set(true);
 *     const handleOffline = () => isOnline.set(false);
 *
 *     window.addEventListener('online', handleOnline);
 *     window.addEventListener('offline', handleOffline);
 *
 *     // Return cleanup function
 *     return () => {
 *       window.removeEventListener('online', handleOnline);
 *       window.removeEventListener('offline', handleOffline);
 *       console.log('Event listeners cleaned up');
 *     };
 *   }
 * });
 *
 * // Later, clean up manually if needed
 * cleanup();
 * ```
 *
 * @example
 * ```typescript
 * // Effect with error handling and options
 * const data = signal<any[]>([]);
 * const isLoading = signal(false);
 *
 * const dataEffect = effect(async () => {
 *   try {
 *     isLoading.set(true);
 *     const response = await fetch('/api/data');
 *     const result = await response.json();
 *     data.set(result);
 *   } catch (error) {
 *     console.error('Failed to fetch data:', error);
 *     data.set([]);
 *   } finally {
 *     isLoading.set(false);
 *   }
 * }, {
 *   name: 'DataFetcher',
 *   maxRuns: 3, // Prevent infinite retries
 *   autoDisable: true
 * });
 *
 * // The effect will be disabled after 3 failed attempts
 * ```
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
 * Internal class that manages the execution and lifecycle of reactive effects.
 * This class handles dependency tracking, execution scheduling, and cleanup.
 *
 * @example
 * ```typescript
 * // This is used internally by the effect() function
 * const count = signal(0);
 *
 * // When you call effect(), it creates a ReactiveEffect instance
 * const cleanup = effect(() => {
 *   console.log('Count is:', count.get());
 * });
 *
 * // The cleanup function allows you to stop the effect
 * cleanup();
 * ```
 */
class ReactiveEffect implements EffectContext {
  /** Set of dependency sets that this effect depends on */
  deps: Set<Set<Subscriber>> = new Set();
  /** The function to execute when the effect runs */
  readonly fn: Subscriber;
  /** Optional configuration options for the effect */
  readonly options?: EffectOptions;

  /**
   * Creates a new reactive effect and immediately runs it.
   *
   * @param fn - The function to execute as the effect
   * @param options - Optional configuration options
   */
  constructor(fn: Subscriber, options?: EffectOptions) {
    this.fn = fn;
    this.options = options;
    this.run();
  }

  /**
   * Executes the effect function and tracks dependencies.
   * This method is called automatically when dependencies change.
   */
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

  /**
   * Cleans up all dependencies and stops tracking them.
   * This method is called when the effect is stopped or cleaned up.
   */
  cleanup() {
    for (const dep of this.deps) {
      dep.delete(this.fn);
    }
    this.deps.clear();
  }
}

/**
 * Creates a reactive signal with an initial value.
 * Signals are the foundation of Tacit-DOM's reactivity system and automatically track dependencies
 * when accessed within effects or computed values.
 *
 * @template T - The type of value to store in the signal
 * @param initialValue - The initial value for the signal
 * @returns A signal object with methods to get, set, update, and subscribe to changes
 *
 * @example
 * ```typescript
 * // Create a simple signal
 * const count = signal(0);
 * console.log(count.get()); // 0
 *
 * // Update the value
 * count.set(5);
 * console.log(count.get()); // 5
 *
 * // Subscribe to changes
 * const unsubscribe = count.subscribe(() => {
 *   console.log('Count changed to:', count.get());
 * });
 *
 * // Use in effects
 * effect(() => {
 *   console.log('Current count:', count.get());
 * });
 *
 * // Async updates
 * await count.update(async (prev) => {
 *   const result = await fetch('/api/increment', {
 *     method: 'POST',
 *     body: JSON.stringify({ value: prev })
 *   });
 *   return (await result.json()).newValue;
 * });
 *
 * // Check pending state
 * if (count.pending) {
 *   console.log('Signal is being updated...');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Form state management
 * const formData = signal({
 *   name: '',
 *   email: '',
 *   age: 0
 * });
 *
 * // Update individual fields
 * formData.set({ ...formData.get(), name: 'John' });
 *
 * // Or use update for derived values
 * await formData.update(async (prev) => {
 *   // Validate email format
 *   const isValid = await validateEmail(prev.email);
 *   return { ...prev, isValid };
 * });
 *
 * // Subscribe to form changes
 * formData.subscribe(() => {
 *   console.log('Form updated:', formData.get());
 * });
 * ```
 *
 * @example
 * ```typescript
 * // UI state management
 * const isLoading = signal(false);
 * const error = signal<string | null>(null);
 * const data = signal<any[]>([]);
 *
 * // Loading state with pending
 * const fetchData = async () => {
 *   isLoading.set(true);
 *   error.set(null);
 *
 *   try {
 *     const response = await fetch('/api/data');
 *     const result = await response.json();
 *     data.set(result);
 *   } catch (err) {
 *     error.set(err.message);
 *   } finally {
 *     isLoading.set(false);
 *   }
 * };
 *
 * // Use in UI components
 * if (isLoading.get()) {
 *   console.log('Loading...');
 * } else if (error.get()) {
 *   console.log('Error:', error.get());
 * } else {
 *   console.log('Data:', data.get());
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Signals work with any type
 * const user = signal({ name: 'John', age: 30 });
 * const isVisible = signal(true);
 * const tags = signal(['react', 'typescript']);
 *
 * // Update object properties
 * user.set({ ...user.get(), age: 31 });
 *
 * // Toggle boolean
 * isVisible.set(!isVisible.get());
 *
 * // Modify array
 * tags.set([...tags.get(), 'tacit-dom']);
 * ```
 */
function signal<T>(initialValue: T): Signal<T> {
  return createSignal(initialValue);
}

function createSignal<T>(initialValue: T): Signal<T> {
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
 * Computed values are derived from other signals and computed values, and their results
 * are cached until dependencies change.
 *
 * @template T - The type of computed value
 * @param computeFn - Function that computes the value based on other reactive values
 * @returns A computed value object that automatically tracks dependencies and caches results
 *
 * @example
 * ```typescript
 * // Basic computed value
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 *
 * const fullName = computed(() => {
 *   return firstName.get() + ' ' + lastName.get();
 * });
 *
 * console.log(fullName.get()); // "John Doe"
 *
 * firstName.set('Jane');
 * console.log(fullName.get()); // "Jane Doe"
 * ```
 *
 * @example
 * ```typescript
 * // Computed values can depend on other computed values
 * const count = signal(0);
 * const doubled = computed(() => count.get() * 2);
 * const quadrupled = computed(() => doubled.get() * 2);
 *
 * console.log(quadrupled.get()); // 0
 * count.set(5);
 * console.log(quadrupled.get()); // 20
 * ```
 *
 * @example
 * ```typescript
 * // Computed values with complex logic
 * const items = signal(['apple', 'banana', 'cherry']);
 * const searchTerm = signal('');
 *
 * const filteredItems = computed(() => {
 *   const term = searchTerm.get().toLowerCase();
 *   return items.get().filter(item =>
 *     item.toLowerCase().includes(term)
 *   );
 * });
 *
 * const itemCount = computed(() => filteredItems.get().length);
 *
 * console.log(filteredItems.get()); // ['apple', 'banana', 'cherry']
 * console.log(itemCount.get()); // 3
 *
 * searchTerm.set('a');
 * console.log(filteredItems.get()); // ['apple', 'banana']
 * console.log(itemCount.get()); // 2
 * ```
 *
 * @example
 * ```typescript
 * // Computed values in effects
 * const price = signal(10);
 * const quantity = signal(5);
 * const total = computed(() => price.get() * quantity.get());
 *
 * effect(() => {
 *   console.log(`Total price: $${total.get()}`);
 * });
 *
 * // This will automatically log: "Total price: $50"
 * price.set(12);
 * // This will automatically log: "Total price: $60"
 * ```
 *
 * @example
 * ```typescript
 * // Computed values for derived state
 * const todos = signal([
 *   { id: 1, text: 'Learn Tacit-DOM', completed: false },
 *   { id: 2, text: 'Build app', completed: true },
 *   { id: 3, text: 'Deploy', completed: false }
 * ]);
 *
 * const completedTodos = computed(() =>
 *   todos.get().filter(todo => todo.completed)
 * );
 *
 * const activeTodos = computed(() =>
 *   todos.get().filter(todo => !todo.completed)
 * );
 *
 * const completionPercentage = computed(() => {
 *   const total = todos.get().length;
 *   const completed = completedTodos.get().length;
 *   return total > 0 ? (completed / total) * 100 : 0;
 * });
 *
 * console.log(completionPercentage.get()); // 33.33...
 *
 * // Update a todo
 * todos.set(todos.get().map(todo =>
 *   todo.id === 1 ? { ...todo, completed: true } : todo
 * ));
 *
 * console.log(completionPercentage.get()); // 66.66...
 * ```
 *
 * @example
 * ```typescript
 * // Computed values for validation
 * const email = signal('');
 * const password = signal('');
 * const confirmPassword = signal('');
 *
 * const isEmailValid = computed(() => {
 *   const emailValue = email.get();
 *   return emailValue.includes('@') && emailValue.includes('.');
 * });
 *
 * const isPasswordValid = computed(() => {
 *   const passwordValue = password.get();
 *   return passwordValue.length >= 8;
 * });
 *
 * const doPasswordsMatch = computed(() => {
 *   return password.get() === confirmPassword.get();
 * });
 *
 * const isFormValid = computed(() => {
 *   return isEmailValid.get() &&
 *          isPasswordValid.get() &&
 *          doPasswordsMatch.get();
 * });
 *
 * // Use in UI
 * effect(() => {
 *   const submitButton = document.getElementById('submit');
 *   if (submitButton) {
 *     submitButton.disabled = !isFormValid.get();
 *   }
 * });
 * ```
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
    // Remove stray Symbol.toPrimitive property if present
  };

  return computedApi;
}

/**
 * Schedules a subscriber function to be executed during the next update flush.
 * This function is used internally by the reactive system to queue updates.
 *
 * @param subscriber - The function to be executed during the next update cycle
 *
 * @example
 * ```typescript
 * // This is used internally by signals and computed values
 * const count = signal(0);
 *
 * // When count.set() is called, it internally calls scheduleUpdate
 * // for all subscribers, which then calls this function
 * count.set(5);
 *
 * // The effect will run during the next update flush
 * effect(() => {
 *   console.log('Count is:', count.get());
 * });
 * ```
 */
function scheduleUpdate(subscriber: Subscriber): void {
  pendingSubscribers.add(subscriber);
}

/**
 * Batches multiple signal updates into a single effect flush.
 * This is useful for performance optimization when you need to make multiple
 * signal changes that should trigger effects only once.
 *
 * @param fn - Function containing multiple signal updates to batch together
 *
 * @example
 * ```typescript
 * // Without batching - triggers effects multiple times
 * const count = signal(0);
 * const name = signal('John');
 *
 * effect(() => {
 *   console.log('Effect ran:', count.get(), name.get());
 * });
 *
 * count.set(1); // Triggers effect
 * name.set('Jane'); // Triggers effect again
 * ```
 *
 * @example
 * ```typescript
 * // With batching - triggers effect only once
 * const count = signal(0);
 * const name = signal('John');
 *
 * effect(() => {
 *   console.log('Effect ran:', count.get(), name.get());
 * });
 *
 * batch(() => {
 *   count.set(1);
 *   name.set('Jane');
 * }); // Triggers effect only once with both new values
 * ```
 *
 * @example
 * ```typescript
 * // Batching with computed values
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 * const fullName = computed(() => firstName.get() + ' ' + lastName.get());
 *
 * effect(() => {
 *   console.log('Full name changed to:', fullName.get());
 * });
 *
 * // This will only trigger the effect once
 * batch(() => {
 *   firstName.set('Jane');
 *   lastName.set('Smith');
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Nested batching works correctly
 * const a = signal(0);
 * const b = signal(0);
 * const c = signal(0);
 *
 * effect(() => {
 *   console.log('Values:', a.get(), b.get(), c.get());
 * });
 *
 * batch(() => {
 *   a.set(1);
 *
 *   batch(() => {
 *     b.set(2);
 *     c.set(3);
 *   });
 * }); // Effect runs only once with all new values
 * ```
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
 * Executes all pending subscriber updates in a controlled manner.
 * This function processes the update queue and handles infinite loop detection.
 * It's called automatically by the reactive system when updates are scheduled.
 *
 * @example
 * ```typescript
 * // This function is called automatically when:
 * const count = signal(0);
 *
 * effect(() => {
 *   console.log('Count is:', count.get());
 * });
 *
 * count.set(5); // Internally calls scheduleUpdate, then flushUpdates
 *
 * // The effect runs during flushUpdates, not immediately
 * ```
 *
 * @example
 * ```typescript
 * // Batching defers flushUpdates until the batch completes
 * batch(() => {
 *   count.set(1);
 *   count.set(2);
 *   count.set(3);
 * }); // flushUpdates is called once after all updates
 * ```
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

export {
  batch,
  computed,
  effect,
  // Template-string interpolation helpers
  getReactiveById,
  REACTIVE_MARKER_PREFIX,
  REACTIVE_MARKER_SUFFIX,
  setDebugMode,
  signal,
};
export type { Computed, EffectContext, EffectOptions, Signal, Subscriber };
