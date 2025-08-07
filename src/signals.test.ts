import {
  clearComponentInstance,
  setComponentInstance,
  signal,
} from './signals';

describe('Unified Signals', () => {
  beforeEach(() => {
    // Clear any existing component instance
    clearComponentInstance();
  });

  afterEach(() => {
    // Clean up
    clearComponentInstance();
  });

  test('signal with key maintains state between renders', () => {
    const componentInstance1 = {};
    const componentInstance2 = {};

    // First render
    setComponentInstance(componentInstance1);
    const signal1 = signal(42, 'test');
    expect(signal1.get()).toBe(42);

    // Update the signal
    signal1.set(100);
    expect(signal1.get()).toBe(100);

    // Clear component instance (simulate end of render)
    clearComponentInstance();

    // Second render with same component instance
    setComponentInstance(componentInstance1);
    const signal2 = signal(0, 'test'); // Different initial value
    expect(signal2.get()).toBe(100); // Should preserve the previous value

    clearComponentInstance();
  });

  test('signal creates new signal for different keys', () => {
    const componentInstance = {};
    setComponentInstance(componentInstance);

    const signal1 = signal(10, 'key1');
    const signal2 = signal(20, 'key2');

    expect(signal1.get()).toBe(10);
    expect(signal2.get()).toBe(20);

    signal1.set(30);
    signal2.set(40);

    expect(signal1.get()).toBe(30);
    expect(signal2.get()).toBe(40);

    clearComponentInstance();
  });

  test('signal without key creates regular signal when no component context', () => {
    const signal1 = signal(42);
    expect(signal1.get()).toBe(42);

    signal1.set(100);
    expect(signal1.get()).toBe(100);
  });

  test('signal without key creates regular signal when in component context', () => {
    const componentInstance = {};
    setComponentInstance(componentInstance);

    const signal1 = signal(42); // No key provided
    expect(signal1.get()).toBe(42);

    signal1.set(100);
    expect(signal1.get()).toBe(100);

    clearComponentInstance();
  });

  test('different component instances have separate preserved signals', () => {
    const componentInstance1 = {};
    const componentInstance2 = {};

    // First component
    setComponentInstance(componentInstance1);
    const signal1 = signal(10, 'test');
    signal1.set(50);
    clearComponentInstance();

    // Second component
    setComponentInstance(componentInstance2);
    const signal2 = signal(20, 'test');
    expect(signal2.get()).toBe(20); // Should get initial value, not preserved from component1
    clearComponentInstance();
  });

  test('global signals work normally', () => {
    const globalSignal = signal(42);
    expect(globalSignal.get()).toBe(42);

    globalSignal.set(100);
    expect(globalSignal.get()).toBe(100);
  });
});
