import { computed, effect, signal } from '../../src/signals';

// ============================================================================
// REACTIVE SIGNAL SYSTEM EXPLANATION
// ============================================================================
//
// This file demonstrates the core concepts of Tacit-DOM's reactive system:
//
// 1. SIGNALS: Mutable containers that hold values and notify subscribers when changed
// 2. COMPUTED: Derived values that automatically recalculate when dependencies change
// 3. EFFECTS: Side effects that automatically run when their dependencies change
// 4. DEPENDENCY TRACKING: The system automatically tracks which signals each computed/effect uses
//
// How it works:
// - When you call .get() on a signal inside a computed or effect, it registers as a dependency
// - When a signal changes, all computed values and effects that depend on it automatically re-run
// - This creates a reactive graph where changes propagate automatically through the system
// ============================================================================

// Create reactive signals for storing state
// These are the "source of truth" - when they change, everything that depends on them updates
export const signalA = signal(0);
export const signalB = signal(0);

/**
 * Computed signal that combines values from signalA and signalB
 *
 * HOW IT WORKS:
 * - This function runs every time it's accessed (via .get())
 * - It calls .get() on signalA and signalB, registering them as dependencies
 * - If either signal changes, this computed value automatically recalculates
 * - The result is cached until dependencies change (performance optimization)
 *
 * DEPENDENCY TRACKING:
 * - signalA.get() → registers signalA as a dependency
 * - signalB.get() → registers signalB as a dependency
 * - When either changes → this computed re-runs automatically
 */
export const computedC = computed(() => {
  console.log('computed signalC');
  return signalA.get() + ' / ' + signalB.get();
});

/**
 * Effect that runs whenever computedC changes
 *
 * HOW IT WORKS:
 * - Effects are like computed values but for side effects (console.log, DOM updates, etc.)
 * - They automatically re-run when any of their dependencies change
 * - This effect depends on computedC, which depends on signalA and signalB
 * - So it runs whenever signalA OR signalB changes (transitive dependency)
 *
 * DEPENDENCY CHAIN:
 * signalA/signalB → computedC → this effect
 */
effect(() => {
  console.log('effect signalA', computedC.get());
});

/**
 * Effect that monitors changes to both signalA and signalB
 *
 * HOW IT WORKS:
 * - This effect directly depends on both signals
 * - It runs every time either signal changes
 * - Useful for logging, debugging, or triggering other side effects
 *
 * DIRECT DEPENDENCIES:
 * - signalA.get() → registers signalA as dependency
 * - signalB.get() → registers signalB as dependency
 */
effect(() => {
  console.log(
    `Signals updated - signalA: ${signalA.get()}, signalB: ${signalB.get()}`,
  );
});

/**
 * Updates signalA by incrementing its current value
 *
 * HOW IT WORKS:
 * - .set() immediately updates the signal value
 * - Triggers all computed values and effects that depend on signalA
 * - This causes a "reactive update cycle" where changes propagate through the system
 *
 * UPDATE CYCLE:
 * 1. signalA.set(newValue)
 * 2. computedC detects signalA changed → recalculates
 * 3. Effects depending on computedC run
 * 4. Effects depending on signalA run
 * 5. Any components using these values re-render
 */
export const updateA = () => {
  signalA.set(signalA.get() + 1);
};

/**
 * Updates signalB by incrementing its current value
 *
 * HOW IT WORKS:
 * - .update() is a functional way to update based on current value
 * - Equivalent to: signalB.set(signalB.get() + 1)
 * - Still triggers the same reactive update cycle
 *
 * ADVANTAGES OF .update():
 * - More functional programming style
 * - Easier to chain multiple updates
 * - Better for complex update logic
 */
export const updateB = () => {
  signalB.update((value) => value + 1);
};

/**
 * Updates signalB asynchronously with a simulated delay
 *
 * HOW IT WORKS:
 * - Async updates are supported natively
 * - The signal enters a "pending" state during the update
 * - Components can check .pending to show loading states
 * - When the async operation completes, the signal updates and triggers reactivity
 *
 * ASYNC UPDATE CYCLE:
 * 1. signalB.update(async fn) → signal enters pending state
 * 2. Components can check signalB.pending for loading UI
 * 3. Async operation completes → signal updates with new value
 * 4. Reactive system triggers updates to all dependents
 * 5. Loading states automatically clear
 */
export const updateBAsync = async () => {
  await signalB.update(async (value) => {
    // Simulate some async operation (e.g., API call)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return value + 1;
  });
};

/**
 * Utility function to get the current status of signalB
 *
 * HOW IT WORKS:
 * - Returns both the current value and pending state
 * - Useful for components that need to know both pieces of information
 * - The pending state is automatically managed by the async update system
 *
 * PENDING STATE:
 * - true: signal is currently being updated asynchronously
 * - false: signal is stable (no pending updates)
 */
export const getSignalBStatus = () => {
  return {
    value: signalB.get(),
    pending: signalB.pending,
  };
};
