/**
 * @fileoverview Simple reactive primitives for the reactive-dom library.
 *
 * This module provides two core reactive primitives:
 * - Signal: A reactive value that can be read and written
 * - Computed: A derived reactive value that updates automatically
 */

/**
 * A reactive signal that holds a value and notifies subscribers when it changes.
 */
export class Signal<T> {
  private value: T;
  private subscribers = new Set<() => void>();
  private isNotifying = false; // Prevent infinite rerenders

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  /**
   * Gets the current value of the signal.
   * If called within a computation, this signal becomes a dependency.
   */
  get(): T {
    // Track this signal in the current computation
    if (Computed.currentComputation) {
      Computed.currentComputation.addDependency(this);
    }
    return this.value;
  }

  /**
   * Sets a new value for the signal.
   * If the value has changed, all subscribers are notified.
   */
  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.notify();
    }
  }

  /**
   * Subscribes to changes in this signal's value.
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notifies all subscribers that the value has changed.
   */
  private notify(): void {
    // Prevent infinite rerenders
    if (this.isNotifying) {
      console.warn('Signal: Infinite rerender detected, skipping notification');
      return;
    }

    this.isNotifying = true;
    try {
      this.subscribers.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error('Error in signal subscriber:', error);
        }
      });
    } finally {
      this.isNotifying = false;
    }
  }
}

/**
 * A computed reactive value that automatically updates when its dependencies change.
 */
export class Computed<T> {
  private fn: () => T;
  private value: T | undefined;
  private isDirty = true;
  private dependencies = new Set<Signal<any> | Computed<any>>();
  private subscriptions = new Set<() => void>();
  private isComputing = false;
  private subscribers = new Set<() => void>();
  private isNotifying = false; // Prevent infinite rerenders
  private recomputeCount = 0; // Track recompute attempts
  private readonly MAX_RECOMPUTES = 1000; // Maximum recomputes per cycle
  private lastRecomputeTime = Date.now();

  // Static property to track the current computation context
  static currentComputation: Computed<any> | null = null;

  constructor(fn: () => T) {
    this.fn = fn;
  }

  /**
   * Gets the current computed value.
   * If the computation is dirty, it will be recomputed automatically.
   */
  get(): T {
    // Track this computation in the current computation
    if (Computed.currentComputation && Computed.currentComputation !== this) {
      Computed.currentComputation.addDependency(this);
    }

    if (this.isDirty && !this.isComputing) {
      this.recompute();
    }

    return this.value!;
  }

  /**
   * Recomputes the value by running the computation function.
   */
  private recompute(): void {
    if (this.isComputing) {
      console.warn(
        'Computed: Infinite computation detected, skipping recompute',
      );
      return;
    }

    // Check for infinite recompute loops
    this.recomputeCount++;
    const now = Date.now();

    // Reset counter every 100ms to allow normal operation
    if (now - this.lastRecomputeTime > 100) {
      this.recomputeCount = 0;
      this.lastRecomputeTime = now;
    }

    if (this.recomputeCount > this.MAX_RECOMPUTES) {
      console.error(
        'Computed: Maximum recompute limit exceeded, possible infinite loop',
      );
      return;
    }

    this.isComputing = true;
    const previousComputation = Computed.currentComputation;
    Computed.currentComputation = this;

    // Clear old dependencies and subscriptions
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
    this.dependencies.clear();

    try {
      this.value = this.fn();
    } finally {
      Computed.currentComputation = previousComputation;
      this.isComputing = false;
    }

    this.isDirty = false;
    this.recomputeCount = 0; // Reset counter on successful recompute
  }

  /**
   * Marks the computation as dirty, indicating it needs to be recalculated.
   */
  private markDirty(): void {
    if (!this.isDirty && !this.isComputing) {
      this.isDirty = true;
      this.notify();
    }
  }

  /**
   * Adds a dependency to this computation.
   */
  addDependency(dependency: Signal<any> | Computed<any>): void {
    if (this.dependencies.has(dependency)) return;

    this.dependencies.add(dependency);
    const unsubscribe = dependency.subscribe(() => {
      this.markDirty();
    });
    this.subscriptions.add(unsubscribe);
  }

  /**
   * Subscribes to changes in this computation's value.
   */
  subscribe(callback: () => void): () => void {
    // Ensure we have the latest dependencies by calling get() once
    if (this.isDirty) {
      this.get();
    }
    // Add the callback to subscribers and return unsubscribe function
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notifies all subscribers that the value has changed.
   */
  private notify(): void {
    // Prevent infinite rerenders
    if (this.isNotifying) {
      console.warn(
        'Computed: Infinite rerender detected, skipping notification',
      );
      return;
    }

    this.isNotifying = true;
    try {
      this.subscribers.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error('Error in computed subscriber:', error);
        }
      });
    } finally {
      this.isNotifying = false;
    }
  }
}

/**
 * Creates a new reactive signal with an initial value.
 */
export function signal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

/**
 * Creates a new computed signal that automatically updates when its dependencies change.
 */
export function computed<T>(fn: () => T): Computed<T> {
  return new Computed(fn);
}
