import { computed, effect, signal } from '../../src/index';

// Create reactive counters for storing state
// These are the "source of truth" - when they change, everything that depends on them updates
export const counterA = signal(0);
export const counterB = signal(0);

/**
 * Computed counter that combines values from counterA and counterB
 *
 * HOW IT WORKS:
 * - This function runs every time it's accessed (via .get())
 * - It calls .get() on counterA and counterB, registering them as dependencies
 * - If either counter changes, this computed value automatically recalculates
 * - The result is cached until dependencies change (performance optimization)
 *
 * DEPENDENCY TRACKING:
 * - counterA.get() → registers counterA as a dependency
 * - counterB.get() → registers counterB as a dependency
 * - When either changes → this computed re-runs automatically
 */
export const computedC = computed(() => {
  const valueA = counterA.get();
  const valueB = counterB.get();

  // Calculate combined statistics
  const total = valueA + valueB;
  const percentageA = total > 0 ? Math.round((valueA / total) * 100) : 0;
  const percentageB = total > 0 ? Math.round((valueB / total) * 100) : 0;

  // Determine which value is larger
  let leader = 'Equal';
  if (valueA > valueB) leader = 'Counter A';
  else if (valueB > valueA) leader = 'Counter B';

  return {
    total,
    percentageA,
    percentageB,
    leader,
    score: `${valueA} - ${valueB}`,
    summary: `${leader} ${leader === 'Equal' ? 'are equal' : 'is leading'} (${percentageA}% - ${percentageB}%)`,
  };
});

/**
 * Effect that runs whenever computedC changes
 *
 * HOW IT WORKS:
 * - Effects are like computed values but for side effects (console.log, DOM updates, etc.)
 * - They automatically re-run when any of their dependencies change
 * - This effect depends on computedC, which depends on counterA and counterB
 * - So it runs whenever counterA OR counterB changes (transitive dependency)
 *
 * DEPENDENCY CHAIN:
 * counterA/counterB → computedC → this effect
 */
effect(() => {
  const status = computedC.get();
  console.log('Computed value updated:', status.summary);
});

/**
 * Effect that monitors changes to both counterA and counterB
 *
 * HOW IT WORKS:
 * - This effect directly depends on both counters
 * - It runs every time either counter changes
 * - Useful for logging, debugging, or triggering other side effects
 *
 * DIRECT DEPENDENCIES:
 * - counterA.get() → registers counterA as dependency
 * - counterB.get() → registers counterB as dependency
 */
effect(() => {
  console.log(
    `Counters updated - Counter A: ${counterA.get()}, Counter B: ${counterB.get()}`,
  );
});

/**
 * Updates counterA by incrementing its current value
 *
 * HOW IT WORKS:
 * - .set() immediately updates the counter value
 * - Triggers all computed values and effects that depend on counterA
 * - This causes a "reactive update cycle" where changes propagate through the system
 *
 * UPDATE CYCLE:
 * 1. counterA.set(newValue)
 * 2. computedC detects counterA changed → recalculates
 * 3. Effects depending on computedC run
 * 4. Effects depending on counterA run
 * 5. Any components using these values re-render
 */
export const updateA = () => {
  counterA.set(counterA.get() + 1);
};

/**
 * Updates counterB by incrementing its current value
 *
 * HOW IT WORKS:
 * - .update() is a functional way to update based on current value
 * - Equivalent to: counterB.set(counterB.get() + 1)
 * - Still triggers the same reactive update cycle
 *
 * ADVANTAGES OF .update():
 * - More functional programming style
 * - Easier to chain multiple updates
 * - Better for complex update logic
 */
export const updateB = () => {
  counterB.update((value: number) => value + 1);
};

/**
 * Updates counterB asynchronously with a simulated delay
 *
 * HOW IT WORKS:
 * - Async updates are supported natively
 * - The counter enters a "pending" state during the update
 * - Components can check .pending to show loading states
 * - When the async operation completes, the counter updates and triggers reactivity
 *
 * ASYNC UPDATE CYCLE:
 * 1. counterB.update(async fn) → counter enters pending state
 * 2. Components can check counterB.pending for loading UI
 * 3. Async operation completes → counter updates with new value
 * 4. Reactive system triggers updates to all dependents
 * 5. Loading states automatically clear
 */
export const updateBAsync = async () => {
  await counterB.update(async (value: number) => {
    // Simulate some async operation (e.g., API call)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return value + 1;
  });
};

/**
 * Utility function to get the current status of counterB
 *
 * HOW IT WORKS:
 * - Returns both the current value and pending state
 * - Useful for components that need to know both pieces of information
 * - The pending state is automatically managed by the async update system
 *
 * PENDING STATE:
 * - true: counter is currently being updated asynchronously
 * - false: counter is stable (no pending updates)
 */
export const getCounterBStatus = () => {
  return {
    value: counterB.get(),
    pending: counterB.pending,
  };
};
