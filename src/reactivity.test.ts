import { signal, computed, Signal, Computed } from './reactivity';

describe('Signal', () => {
  describe('basic functionality', () => {
    it('should create a signal with initial value', () => {
      const s = signal(42);
      expect(s.get()).toBe(42);
    });

    it('should update value when set', () => {
      const s = signal(0);
      s.set(100);
      expect(s.get()).toBe(100);
    });

    it('should not notify subscribers when value is the same', () => {
      const s = signal(42);
      const mockCallback = jest.fn();
      s.subscribe(mockCallback);

      s.set(42); // Same value
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should notify subscribers when value changes', () => {
      const s = signal(0);
      const mockCallback = jest.fn();
      s.subscribe(mockCallback);

      s.set(100);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple subscribers', () => {
      const s = signal(0);
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      s.subscribe(mockCallback1);
      s.subscribe(mockCallback2);

      s.set(100);
      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe when unsubscribe function is called', () => {
      const s = signal(0);
      const mockCallback = jest.fn();
      const unsubscribe = s.subscribe(mockCallback);

      s.set(100);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      unsubscribe();
      s.set(200);
      expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('error handling', () => {
    it('should handle errors in subscribers gracefully', () => {
      const s = signal(0);
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = jest.fn();

      s.subscribe(errorCallback);
      s.subscribe(normalCallback);

      // Should not throw and should still call other subscribers
      expect(() => s.set(100)).not.toThrow();
      expect(normalCallback).toHaveBeenCalledTimes(1);
    });

    it('should prevent infinite rerenders', () => {
      const s = signal(0);
      let callCount = 0;

      s.subscribe(() => {
        callCount++;
        if (callCount < 10) {
          s.set(s.get() + 1);
        }
      });

      s.set(1);
      expect(callCount).toBeLessThanOrEqual(10);
    });
  });

  describe('with different types', () => {
    it('should work with strings', () => {
      const s = signal('hello');
      expect(s.get()).toBe('hello');
      s.set('world');
      expect(s.get()).toBe('world');
    });

    it('should work with objects', () => {
      const obj = { name: 'John', age: 30 };
      const s = signal(obj);
      expect(s.get()).toBe(obj);

      const newObj = { name: 'Jane', age: 25 };
      s.set(newObj);
      expect(s.get()).toBe(newObj);
    });

    it('should work with arrays', () => {
      const arr = [1, 2, 3];
      const s = signal(arr);
      expect(s.get()).toBe(arr);

      const newArr = [4, 5, 6];
      s.set(newArr);
      expect(s.get()).toBe(newArr);
    });

    it('should work with null and undefined', () => {
      const s = signal(null);
      expect(s.get()).toBe(null);

      s.set(undefined);
      expect(s.get()).toBe(undefined);
    });
  });
});

describe('Computed', () => {
  describe('basic functionality', () => {
    it('should create a computed value', () => {
      const s = signal(5);
      const c = computed(() => s.get() * 2);
      expect(c.get()).toBe(10);
    });

    it('should update when dependencies change', () => {
      const s = signal(5);
      const c = computed(() => s.get() * 2);

      expect(c.get()).toBe(10);
      s.set(10);
      expect(c.get()).toBe(20);
    });

    it('should only recompute when dirty', () => {
      const s = signal(5);
      let computeCount = 0;
      const c = computed(() => {
        computeCount++;
        return s.get() * 2;
      });

      expect(c.get()).toBe(10);
      expect(computeCount).toBe(1);

      // Getting again should not recompute
      expect(c.get()).toBe(10);
      expect(computeCount).toBe(1);

      // Only recompute when dependency changes
      s.set(10);
      expect(c.get()).toBe(20);
      expect(computeCount).toBe(2);
    });

    it('should handle multiple dependencies', () => {
      const a = signal(1);
      const b = signal(2);
      const c = computed(() => a.get() + b.get());

      expect(c.get()).toBe(3);

      a.set(5);
      expect(c.get()).toBe(7);

      b.set(10);
      expect(c.get()).toBe(15);
    });

    it('should handle nested computations', () => {
      const a = signal(2);
      const b = signal(3);
      const c1 = computed(() => a.get() * b.get());
      const c2 = computed(() => c1.get() + 1);

      expect(c2.get()).toBe(7);

      a.set(4);
      expect(c2.get()).toBe(13);
    });
  });

  describe('subscription behavior', () => {
    it('should subscribe to dependencies', () => {
      const s = signal(5);
      const c = computed(() => s.get() * 2);
      const mockCallback = jest.fn();

      c.subscribe(mockCallback);
      expect(mockCallback).not.toHaveBeenCalled(); // Initial subscription doesn't trigger

      s.set(10);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from dependencies when unsubscribed', () => {
      const s = signal(5);
      const c = computed(() => s.get() * 2);
      const mockCallback = jest.fn();
      const unsubscribe = c.subscribe(mockCallback);

      s.set(10);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      unsubscribe();
      s.set(15);
      expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should handle multiple subscribers', () => {
      const s = signal(5);
      const c = computed(() => s.get() * 2);
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      c.subscribe(mockCallback1);
      c.subscribe(mockCallback2);

      s.set(10);
      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle errors in computation function', () => {
      const s = signal(5);
      const c = computed(() => {
        if (s.get() > 10) {
          throw new Error('Value too high');
        }
        return s.get() * 2;
      });

      expect(c.get()).toBe(10);

      // Should handle error gracefully
      expect(() => {
        s.set(15);
        c.get();
      }).toThrow('Value too high');
    });

    it('should handle errors in subscribers gracefully', () => {
      const s = signal(5);
      const c = computed(() => s.get() * 2);
      const errorCallback = jest.fn(() => {
        throw new Error('Subscriber error');
      });
      const normalCallback = jest.fn();

      c.subscribe(errorCallback);
      c.subscribe(normalCallback);

      expect(() => s.set(10)).not.toThrow();
      expect(normalCallback).toHaveBeenCalledTimes(1);
    });

    it('should prevent infinite computation loops', () => {
      const s = signal(0);
      const c = computed(() => {
        const current = s.get();
        if (current < 5) {
          s.set(current + 1);
        }
        return current;
      });

      // Should not cause infinite loop
      expect(() => c.get()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty computation function', () => {
      const c = computed(() => {});
      expect(c.get()).toBe(undefined);
    });

    it('should handle computation that returns different types', () => {
      const s = signal(5);
      const c = computed(() => {
        const val = s.get();
        if (val > 5) {
          return 'high';
        } else if (val < 5) {
          return 'low';
        } else {
          return 5;
        }
      });

      expect(c.get()).toBe(5);
      s.set(10);
      expect(c.get()).toBe('high');
      s.set(1);
      expect(c.get()).toBe('low');
    });

    it('should handle computation with no dependencies', () => {
      const c = computed(() => 42);
      expect(c.get()).toBe(42);
    });

    it('should handle computation that depends on itself', () => {
      const c = computed(() => {
        // This should not cause infinite loop due to protection
        return c.get() || 0;
      });

      expect(() => c.get()).not.toThrow();
    });
  });

  describe('performance and limits', () => {
    it('should respect maximum recompute limit', () => {
      const s = signal(0);
      let callCount = 0;
      const c = computed(() => {
        callCount++;
        if (callCount < 100) {
          s.set(s.get() + 1);
        }
        return s.get();
      });

      expect(() => c.get()).not.toThrow();
      expect(callCount).toBeLessThanOrEqual(1000);
    });
  });
});

describe('signal function', () => {
  it('should create a Signal instance', () => {
    const s = signal(42);
    expect(s).toBeInstanceOf(Signal);
    expect(s.get()).toBe(42);
  });

  it('should work with different types', () => {
    const stringSignal = signal('hello');
    const numberSignal = signal(123);
    const objectSignal = signal({ key: 'value' });
    const arraySignal = signal([1, 2, 3]);

    expect(stringSignal.get()).toBe('hello');
    expect(numberSignal.get()).toBe(123);
    expect(objectSignal.get()).toEqual({ key: 'value' });
    expect(arraySignal.get()).toEqual([1, 2, 3]);
  });
});

describe('computed function', () => {
  it('should create a Computed instance', () => {
    const s = signal(5);
    const c = computed(() => s.get() * 2);
    expect(c).toBeInstanceOf(Computed);
    expect(c.get()).toBe(10);
  });

  it('should work with complex computations', () => {
    const a = signal(1);
    const b = signal(2);
    const c = signal(3);

    const result = computed(() => {
      return a.get() * b.get() + c.get();
    });

    expect(result.get()).toBe(5);

    a.set(5);
    expect(result.get()).toBe(13);
  });
});

describe('integration tests', () => {
  it('should work with signals and computations together', () => {
    const count = signal(0);
    const doubled = computed(() => count.get() * 2);
    const isEven = computed(() => count.get() % 2 === 0);

    expect(count.get()).toBe(0);
    expect(doubled.get()).toBe(0);
    expect(isEven.get()).toBe(true);

    count.set(5);
    expect(count.get()).toBe(5);
    expect(doubled.get()).toBe(10);
    expect(isEven.get()).toBe(false);
  });

  it('should handle complex reactive chains', () => {
    const firstName = signal('John');
    const lastName = signal('Doe');
    const fullName = computed(() => `${firstName.get()} ${lastName.get()}`);
    const greeting = computed(() => `Hello, ${fullName.get()}!`);

    expect(greeting.get()).toBe('Hello, John Doe!');

    firstName.set('Jane');
    expect(greeting.get()).toBe('Hello, Jane Doe!');

    lastName.set('Smith');
    expect(greeting.get()).toBe('Hello, Jane Smith!');
  });
});
