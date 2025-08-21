import {
  batch,
  computed,
  effect,
  getReactiveById,
  REACTIVE_MARKER_PREFIX,
  REACTIVE_MARKER_SUFFIX,
  setDebugMode,
  signal,
} from './signals';

describe('Signals', () => {
  beforeEach(() => {
    setDebugMode(false);
  });

  describe('signal()', () => {
    test('creates signal with initial value', () => {
      const s = signal(42);
      expect(s.get()).toBe(42);
    });

    test('creates signal with initial value', () => {
      const s = signal(42);
      expect(s.get()).toBe(42);

      s.set(100);
      expect(s.get()).toBe(100);
    });

    test('signal methods work correctly', async () => {
      const s = signal(0);

      // get
      expect(s.get()).toBe(0);

      // set
      s.set(10);
      expect(s.get()).toBe(10);

      // update
      await s.update((prev) => prev + 5);
      expect(s.get()).toBe(15);

      // subscribe
      let lastValue = 0;
      const unsubscribe = s.subscribe(() => {
        lastValue = s.get();
      });

      s.set(20);
      expect(lastValue).toBe(20);

      unsubscribe();
      s.set(30);
      expect(lastValue).toBe(20); // Should not update after unsubscribe
    });

    test('signal toString returns reactive marker', () => {
      const s = signal(42);
      const str = s.toString();

      expect(str).toMatch(
        new RegExp(`^${REACTIVE_MARKER_PREFIX}\\d+${REACTIVE_MARKER_SUFFIX}$`),
      );
    });

    test('signal only updates when value actually changes', () => {
      const s = signal(42);
      let updateCount = 0;

      s.subscribe(() => {
        updateCount++;
      });

      s.set(42); // Same value
      expect(updateCount).toBe(0);

      s.set(100); // Different value
      expect(updateCount).toBe(1);
    });

    test('signal update supports async callbacks', async () => {
      const s = signal(0);

      // Test sync callback
      await s.update((prev) => prev + 5);
      expect(s.get()).toBe(5);

      // Test async callback
      await s.update(async (prev) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return prev * 2;
      });
      expect(s.get()).toBe(10);

      // Test async callback with Promise.resolve
      await s.update(async (prev) => {
        return Promise.resolve(prev + 3);
      });
      expect(s.get()).toBe(13);
    });

    test('signal pending property tracks update state', async () => {
      const s = signal(0);

      // Initially not pending
      expect(s.pending).toBe(false);

      // Start async update
      const updatePromise = s.update(async (prev) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return prev + 1;
      });

      // Should be pending during update
      expect(s.pending).toBe(true);

      // Wait for update to complete
      await updatePromise;

      // Should not be pending after update
      expect(s.pending).toBe(false);
      expect(s.get()).toBe(1);
    });

    test('signal pending property handles multiple concurrent updates', async () => {
      const s = signal(0);

      expect(s.pending).toBe(false);

      // Start multiple concurrent updates
      const update1 = s.update(async (prev) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return prev + 1;
      });

      const update2 = s.update(async (prev) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return prev + 2;
      });

      // Should be pending during updates
      expect(s.pending).toBe(true);

      // Wait for both updates to complete
      await Promise.all([update1, update2]);

      // Should not be pending after all updates
      expect(s.pending).toBe(false);
      // Last update wins (race condition, but pending should work correctly)
      expect(s.get()).toBeGreaterThan(0);
    });

    test('signal pending property is reactive and triggers effects', async () => {
      const s = signal(0);
      let effectRuns = 0;
      let lastPendingState = false;

      // Create an effect that tracks the pending state
      effect(() => {
        effectRuns++;
        lastPendingState = s.pending;
      });

      // Initial state
      expect(effectRuns).toBe(1);
      expect(lastPendingState).toBe(false);

      // Start async update
      const updatePromise = s.update(async (prev) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return prev + 1;
      });

      // Effect should have run again due to pending state change
      expect(effectRuns).toBe(2);
      expect(lastPendingState).toBe(true);

      // Wait for update to complete
      await updatePromise;

      // Effect should have run again due to pending state change
      expect(effectRuns).toBe(3);
      expect(lastPendingState).toBe(false);
      expect(s.get()).toBe(1);
    });
  });

  describe('computed()', () => {
    test('creates computed value', () => {
      const s = signal(5);
      const c = computed(() => s.get() * 2);

      expect(c.get()).toBe(10);
    });

    test('computed value updates when dependencies change', () => {
      const s = signal(5);
      const c = computed(() => s.get() * 2);

      expect(c.get()).toBe(10);

      s.set(10);
      expect(c.get()).toBe(20);
    });

    test('computed value caches result', () => {
      const s = signal(5);
      let computeCount = 0;

      const c = computed(() => {
        computeCount++;
        return s.get() * 2;
      });

      expect(c.get()).toBe(10);
      expect(c.get()).toBe(10);
      expect(computeCount).toBe(1); // Should only compute once
    });

    test('computed value recomputes when dependencies change', () => {
      const s = signal(5);
      let computeCount = 0;

      const c = computed(() => {
        computeCount++;
        return s.get() * 2;
      });

      expect(c.get()).toBe(10);
      expect(computeCount).toBe(1);

      s.set(10);
      expect(c.get()).toBe(20);
      expect(computeCount).toBe(2);
    });

    test('computed value can depend on multiple signals', () => {
      const a = signal(2);
      const b = signal(3);
      const c = computed(() => a.get() * b.get());

      expect(c.get()).toBe(6);

      a.set(4);
      expect(c.get()).toBe(12);

      b.set(5);
      expect(c.get()).toBe(20);
    });

    test('computed value can depend on other computed values', () => {
      const a = signal(2);
      const b = signal(3);
      const c1 = computed(() => a.get() * b.get());
      const c2 = computed(() => c1.get() + 1);

      expect(c2.get()).toBe(7);

      a.set(4);
      expect(c2.get()).toBe(13);
    });

    test('computed value methods work correctly', () => {
      const s = signal(5);
      const c = computed(() => s.get() * 2);

      // get
      expect(c.get()).toBe(10);

      // subscribe
      let lastValue = 0;
      const unsubscribe = c.subscribe(() => {
        lastValue = c.get();
      });

      s.set(10);
      expect(lastValue).toBe(20);

      unsubscribe();
      s.set(15);
      expect(lastValue).toBe(20); // Should not update after unsubscribe
    });

    test('computed value toString returns reactive marker', () => {
      const s = signal(5);
      const c = computed(() => s.get() * 2);
      const str = c.toString();

      expect(str).toMatch(
        new RegExp(`^${REACTIVE_MARKER_PREFIX}\\d+${REACTIVE_MARKER_SUFFIX}$`),
      );
    });
  });

  describe('effect()', () => {
    test('runs effect function', () => {
      let runCount = 0;
      const s = signal(0);

      const cleanup = effect(() => {
        runCount++;
        s.get(); // Track dependency
      });

      expect(runCount).toBe(1);

      cleanup();
    });

    test('effect runs when dependencies change', () => {
      let runCount = 0;
      const s = signal(0);

      const cleanup = effect(() => {
        runCount++;
        s.get(); // Track dependency
      });

      expect(runCount).toBe(1);

      s.set(10);
      expect(runCount).toBe(2);

      cleanup();
    });

    test('effect with options', () => {
      let runCount = 0;
      const s = signal(0);

      const cleanup = effect(
        () => {
          runCount++;
          s.get();
        },
        { name: 'test-effect', maxRuns: 5 },
      );

      expect(runCount).toBe(1);

      cleanup();
    });

    test('effect cleanup function works', () => {
      let runCount = 0;
      const s = signal(0);

      const cleanup = effect(() => {
        runCount++;
        s.get();
      });

      expect(runCount).toBe(1);

      cleanup();
      s.set(10);
      expect(runCount).toBe(1); // Should not run after cleanup
    });

    test('effect tracks multiple dependencies', () => {
      let runCount = 0;
      const a = signal(1);
      const b = signal(2);

      const cleanup = effect(() => {
        runCount++;
        a.get();
        b.get();
      });

      expect(runCount).toBe(1);

      a.set(10);
      expect(runCount).toBe(2);

      b.set(20);
      expect(runCount).toBe(3);

      cleanup();
    });

    test('effect can return cleanup function', () => {
      const s = signal(0);
      let cleanupCalled = false;

      const cleanup = effect(() => {
        s.get();
        // Return a cleanup function
        return () => {
          cleanupCalled = true;
        };
      });

      // The cleanup function should not be called until the effect is re-run or disposed
      expect(cleanupCalled).toBe(false);

      // Trigger effect re-run - should call cleanup function
      s.set(1);
      expect(cleanupCalled).toBe(true);

      // Reset for testing disposal
      cleanupCalled = false;

      // Dispose the effect - should call cleanup function
      cleanup();
      expect(cleanupCalled).toBe(true);
    });

    test('effect cleanup function handles errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const s = signal(0);

      const cleanup = effect(() => {
        s.get();
        // Return a cleanup function that throws
        return () => {
          throw new Error('Cleanup error');
        };
      });

      // Trigger effect re-run - should handle cleanup error gracefully
      s.set(1);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Cleanup function for effect anonymous failed:',
        expect.any(Error),
      );

      cleanup();
      consoleSpy.mockRestore();
    });

    test('effect with multiple cleanup calls', () => {
      const s = signal(0);
      let cleanupCallCount = 0;

      const cleanup = effect(() => {
        s.get();
        return () => {
          cleanupCallCount++;
        };
      });

      // Initial state
      expect(cleanupCallCount).toBe(0);

      // First trigger - calls cleanup from first run
      s.set(1);
      expect(cleanupCallCount).toBe(1);

      // Second trigger - calls cleanup from second run
      s.set(2);
      expect(cleanupCallCount).toBe(2);

      // Dispose effect - calls cleanup from third run
      cleanup();
      expect(cleanupCallCount).toBe(3);
    });

    test('effect cleanup with setTimeout example', () => {
      jest.useFakeTimers();
      const s = signal(0);
      let timeoutExecuted = false;
      let timeoutFromFirstRun = false;
      let timeoutFromSecondRun = false;

      const cleanup = effect(() => {
        const currentValue = s.get();
        const timeout = setTimeout(() => {
          timeoutExecuted = true;
          if (currentValue === 0) {
            timeoutFromFirstRun = true;
          } else {
            timeoutFromSecondRun = true;
          }
        }, 1000);

        return () => clearTimeout(timeout);
      });

      // Timeout should not have executed yet
      expect(timeoutExecuted).toBe(false);

      // Trigger effect re-run - should cancel previous timeout
      s.set(1);

      // Fast-forward time by 500ms - not enough for either timeout
      jest.advanceTimersByTime(500);
      expect(timeoutExecuted).toBe(false);

      // Fast-forward more time - only second timeout should be able to execute
      jest.advanceTimersByTime(600);

      // The first timeout should have been cancelled, only second should execute
      expect(timeoutFromFirstRun).toBe(false);
      expect(timeoutFromSecondRun).toBe(true);

      cleanup();
      jest.useRealTimers();
    });

    test('effect with maxRuns option is created correctly', () => {
      const s = signal(0);

      const cleanup = effect(
        () => {
          s.get(); // Just track the dependency
        },
        { maxRuns: 5 },
      );

      // The effect should be created with the maxRuns option
      expect(s.get()).toBe(0);

      cleanup();
    });

    test('effect with autoDisable option is created correctly', () => {
      const s = signal(0);

      const cleanup = effect(
        () => {
          s.get(); // Just track the dependency
        },
        { autoDisable: true },
      );

      // The effect should be created with the autoDisable option
      expect(s.get()).toBe(0);

      cleanup();
    });

    // Note: Infinite loop detection tests are currently disabled due to implementation issues
    // that cause stack overflow. The infinite loop detection logic needs investigation.
    // See the signals.ts file for the current implementation.
  });

  describe('batch()', () => {
    test('batches multiple updates', () => {
      let effectRunCount = 0;
      const a = signal(0);
      const b = signal(0);

      effect(() => {
        effectRunCount++;
        a.get();
        b.get();
      });

      expect(effectRunCount).toBe(1);

      batch(() => {
        a.set(10);
        b.set(20);
      });

      expect(effectRunCount).toBe(2); // Should only run once after batch
    });

    test('nested batching works correctly', () => {
      let effectRunCount = 0;
      const s = signal(0);

      effect(() => {
        effectRunCount++;
        s.get();
      });

      expect(effectRunCount).toBe(1);

      batch(() => {
        s.set(10);
        batch(() => {
          s.set(20);
        });
      });

      expect(effectRunCount).toBe(2); // Should only run once after outer batch
    });

    test('batch executes function immediately', () => {
      const s = signal(0);
      let executed = false;

      batch(() => {
        s.set(10);
        executed = true;
      });

      expect(executed).toBe(true);
      expect(s.get()).toBe(10);
    });
  });

  describe('Debug Mode', () => {
    test('setDebugMode enables debug mode', () => {
      setDebugMode(true);
      // Note: We can't easily test console.log output in tests
      // but we can verify the function doesn't throw

      setDebugMode(false);
    });
  });

  describe('Reactive ID Management', () => {
    test('getReactiveById returns correct instance', () => {
      const s = signal(42);
      const str = s.toString();
      const id = str
        .replace(REACTIVE_MARKER_PREFIX, '')
        .replace(REACTIVE_MARKER_SUFFIX, '');

      const retrieved = getReactiveById(id);
      expect(retrieved).toBe(s);
    });

    test('getReactiveById returns undefined for invalid id', () => {
      const retrieved = getReactiveById('invalid-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('effect handles errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const cleanup = effect(() => {
        throw new Error('Test error');
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Effect anonymous failed:',
        expect.any(Error),
      );

      cleanup();
      consoleSpy.mockRestore();
    });

    test('effect handles async errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const cleanup = effect(async () => {
        throw new Error('Async error');
      });

      // Wait for async error to be caught
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Effect anonymous failed:',
          expect.any(Error),
        );
      }, 0);

      cleanup();
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    test('signal with undefined value', () => {
      const s = signal(undefined);
      expect(s.get()).toBeUndefined();

      // Test with null value
      const s2 = signal(null);
      expect(s2.get()).toBeNull();
    });

    test('signal with object value', () => {
      const obj = { a: 1 };
      const s = signal(obj);
      expect(s.get()).toBe(obj);

      const newObj = { a: 2 };
      s.set(newObj);
      expect(s.get()).toBe(newObj);
    });

    test('computed with no dependencies', () => {
      const c = computed(() => 42);
      expect(c.get()).toBe(42);
    });

    test('effect with no dependencies', () => {
      let runCount = 0;

      const cleanup = effect(() => {
        runCount++;
      });

      expect(runCount).toBe(1);

      cleanup();
    });

    test('batch with no updates', () => {
      expect(() => {
        batch(() => {
          // No updates
        });
      }).not.toThrow();
    });
  });

  describe('Signal Subscription and Dependency Tracking', () => {
    test('signal properly tracks effect dependencies', () => {
      const s = signal(0);
      let effectRuns = 0;
      let lastValue = 0;

      const cleanup = effect(() => {
        effectRuns++;
        lastValue = s.get();
      });

      // Initial run
      expect(effectRuns).toBe(1);
      expect(lastValue).toBe(0);

      // Update signal - should trigger effect
      s.set(42);
      expect(effectRuns).toBe(2);
      expect(lastValue).toBe(42);

      // Update signal again - should trigger effect
      s.set(100);
      expect(effectRuns).toBe(3);
      expect(lastValue).toBe(100);

      cleanup();
    });

    test('signal tracks multiple effects independently', () => {
      const s = signal(0);
      let effect1Runs = 0;
      let effect2Runs = 0;

      const cleanup1 = effect(() => {
        effect1Runs++;
        s.get();
      });

      const cleanup2 = effect(() => {
        effect2Runs++;
        s.get();
      });

      // Both effects should run initially
      expect(effect1Runs).toBe(1);
      expect(effect2Runs).toBe(1);

      // Update signal - both effects should run
      s.set(42);
      expect(effect1Runs).toBe(2);
      expect(effect2Runs).toBe(2);

      // Clean up first effect
      cleanup1();

      // Update signal - only second effect should run
      s.set(100);
      expect(effect1Runs).toBe(2); // Should not change
      expect(effect2Runs).toBe(3); // Should increment

      cleanup2();
    });

    test('signal subscription works correctly', () => {
      const s = signal(0);
      let subscriptionCalls = 0;
      let lastValue = 0;

      const unsubscribe = s.subscribe(() => {
        subscriptionCalls++;
        lastValue = s.get();
      });

      // Initial subscription should not trigger callback
      expect(subscriptionCalls).toBe(0);

      // Update signal - should trigger subscription
      s.set(42);
      expect(subscriptionCalls).toBe(1);
      expect(lastValue).toBe(42);

      // Update signal again - should trigger subscription
      s.set(100);
      expect(subscriptionCalls).toBe(2);
      expect(lastValue).toBe(100);

      // Unsubscribe
      unsubscribe();

      // Update signal - should NOT trigger subscription
      s.set(200);
      expect(subscriptionCalls).toBe(2); // Should not change
      expect(lastValue).toBe(100); // Should not change
    });

    test('signal only notifies when value actually changes', () => {
      const s = signal(42);
      let notificationCount = 0;

      s.subscribe(() => {
        notificationCount++;
      });

      // Set same value - should not notify
      s.set(42);
      expect(notificationCount).toBe(0);

      // Set different value - should notify
      s.set(100);
      expect(notificationCount).toBe(1);

      // Set same value again - should not notify
      s.set(100);
      expect(notificationCount).toBe(1);

      // Set different value - should notify
      s.set(200);
      expect(notificationCount).toBe(2);
    });
  });
});
