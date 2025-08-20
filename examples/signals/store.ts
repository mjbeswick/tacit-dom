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
export const userScore = signal(0);
export const computerScore = signal(0);

/**
 * Computed signal that provides rich information about the game state
 *
 * HOW IT WORKS:
 * - This function runs every time it's accessed (via .get())
 * - It calls .get() on userScore and computerScore, registering them as dependencies
 * - If either signal changes, this computed value automatically recalculates
 * - The result is cached until dependencies change (performance optimization)
 *
 * DEPENDENCY TRACKING:
 * - userScore.get() → registers userScore as a dependency
 * - computerScore.get() → registers computerScore as a dependency
 * - When either changes → this computed re-runs automatically
 */
export const gameStatus = computed(() => {
  const user = userScore.get();
  const computer = computerScore.get();

  // Calculate game statistics
  const totalGames = user + computer;
  const userPercentage =
    totalGames > 0 ? Math.round((user / totalGames) * 100) : 0;
  const computerPercentage =
    totalGames > 0 ? Math.round((computer / totalGames) * 100) : 0;

  // Determine game leader
  let leader = 'Tie';
  if (user > computer) leader = 'You';
  else if (computer > user) leader = 'Computer';

  return {
    totalGames,
    userPercentage,
    computerPercentage,
    leader,
    score: `${user} - ${computer}`,
    summary: `${leader} ${leader === 'Tie' ? 'are tied' : 'is winning'} (${userPercentage}% - ${computerPercentage}%)`,
  };
});

/**
 * Effect that runs whenever gameStatus changes
 *
 * HOW IT WORKS:
 * - Effects are like computed values but for side effects (console.log, DOM updates, etc.)
 * - They automatically re-run when any of their dependencies change
 * - This effect depends on gameStatus, which depends on userScore and computerScore
 * - So it runs whenever userScore OR computerScore changes (transitive dependency)
 *
 * DEPENDENCY CHAIN:
 * userScore/computerScore → gameStatus → this effect
 */
effect(() => {
  const status = gameStatus.get();
  console.log('Game status updated:', status.summary);
});

/**
 * Effect that monitors changes to both userScore and computerScore
 *
 * HOW IT WORKS:
 * - This effect directly depends on both signals
 * - It runs every time either signal changes
 * - Useful for logging, debugging, or triggering other side effects
 *
 * DIRECT DEPENDENCIES:
 * - userScore.get() → registers userScore as dependency
 * - computerScore.get() → registers computerScore as dependency
 */
effect(() => {
  console.log(
    `Scores updated - You: ${userScore.get()}, Computer: ${computerScore.get()}`,
  );
});

/**
 * Increments the user score
 *
 * HOW IT WORKS:
 * - .set() immediately updates the signal value
 * - Triggers all computed values and effects that depend on userScore
 * - This causes a "reactive update cycle" where changes propagate through the system
 *
 * UPDATE CYCLE:
 * 1. userScore.set(newValue)
 * 2. gameStatus detects userScore changed → recalculates
 * 3. Effects depending on gameStatus run
 * 4. Effects depending on userScore run
 * 5. Any components using these values re-render
 */
export const incrementUserScore = () => {
  userScore.set(userScore.get() + 1);
};

/**
 * Increments the computer score
 *
 * HOW IT WORKS:
 * - .update() is a functional way to update based on current value
 * - Equivalent to: computerScore.set(computerScore.get() + 1)
 * - Still triggers the same reactive update cycle
 *
 * ADVANTAGES OF .update():
 * - More functional programming style
 * - Easier to chain multiple updates
 * - Better for complex update logic
 */
export const incrementComputerScore = () => {
  computerScore.update((value: number) => value + 1);
};

/**
 * Updates the computer score asynchronously with a simulated delay
 *
 * HOW IT WORKS:
 * - Async updates are supported natively
 * - The signal enters a "pending" state during the update
 * - Components can check .pending to show loading states
 * - When the async operation completes, the signal updates and triggers reactivity
 *
 * ASYNC UPDATE CYCLE:
 * 1. computerScore.update(async fn) → signal enters pending state
 * 2. Components can check computerScore.pending for loading UI
 * 3. Async operation completes → signal updates with new value
 * 4. Reactive system triggers updates to all dependents
 * 5. Loading states automatically clear
 */
export const incrementComputerScoreAsync = async () => {
  await computerScore.update(async (value: number) => {
    // Simulate some async operation (e.g., API call)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return value + 1;
  });
};

/**
 * Utility function to get the current status of computerScore
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
export const getComputerScoreStatus = () => {
  return {
    value: computerScore.get(),
    pending: computerScore.pending,
  };
};
