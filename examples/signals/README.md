# Signals Example

This example demonstrates the Tacit-DOM signal system, including the **store pattern** for global state management and **preserved signals** feature.

## What This Example Shows

1. **Store Pattern**: Centralized state management with persistent signals
2. **Basic Signals**: Global signals that persist across renders
3. **Computed Signals**: Derived state that updates automatically
4. **Effects**: Side effects that run when dependencies change
5. **Preserved Signals**: Component-local state that persists between renders
6. **Regular Signals**: Component-local state that gets recreated on each render

## Key Features Demonstrated

### Store Pattern

The example uses a **store pattern** where all signals are defined in a central `store.ts` file:

```typescript
// store.ts - Centralized state management
export const counterSignal = signal(0);
export const asyncCounterSignal = signal(0);
export const timestampSignal = signal(Date.now());

export const incrementCounter = () =>
  counterSignal.set(counterSignal.get() + 1);
export const incrementAsyncCounter = () =>
  asyncCounterSignal.set(asyncCounterSignal.get() + 1);
export const updateTimestamp = () => timestampSignal.set(Date.now());
```

**Benefits of the Store Pattern:**

- **Persistent State**: Signals maintain their values across component re-renders
- **Centralized Logic**: All state management logic is in one place
- **Reusable Functions**: Update functions can be imported and used by any component
- **Better Testing**: Easier to test state logic in isolation
- **Performance**: Prevents signal recreation on each component render

### Preserved Signals vs Regular Signals

- **Preserved Signals** (`signalD`, `counter`): Maintain their state between renders
- **Regular Signals** (`regularSignal`): Get recreated on each render, losing their state

### Interactive Elements

- **Increment Counter**: Increments `counterSignal` synchronously
- **Increment Async Counter**: Increments `asyncCounterSignal` both synchronously and asynchronously with loading state
- **Update Timestamp**: Updates `timestampSignal` with a new timestamp
- **Re-render**: Forces a complete re-render to show the difference between preserved and regular signals
- **Increment Counter**: Demonstrates that preserved signals maintain their state

## How to Test

1. Click "Increment Counter" a few times - notice the counter increases
2. Click "Re-render" - notice that:
   - The preserved signals (`signalD`, `counter`) maintain their values
   - The regular signal (`regularSignal`) gets a new random value
3. Click "Increment Counter" - changes the global counter signal
4. Click "Increment Async Counter" - changes async counter signal with loading state
5. Click "Update Timestamp" - updates timestamp signal with a new timestamp

## Code Highlights

```typescript
// Store pattern - signals defined at module level
import {
  counterSignal,
  asyncCounterSignal,
  timestampSignal,
  incrementCounter,
  incrementAsyncCounter,
  updateTimestamp,
} from './store';

// Component uses imported signals
const app = component(() => {
  return div(
    div(`Synchronous Counter: ${counterSignal.get()}`),
    div(`Asynchronous Counter: ${asyncCounterSignal.get()}`),
    div(`Current Timestamp: ${timestampSignal.get()}`),
    button({ onclick: incrementCounter }, 'Increment Counter'),
    button({ onclick: incrementAsyncCounter }, 'Increment Async Counter'),
    button({ onclick: updateTimestamp }, 'Update Timestamp'),
  );
});

// Preserved signal - maintains state between renders
const signalD = preservedSignal('signalD', random());

// Regular signal - recreated on each render
const regularSignal = signal(random());

// Preserved signal for counter
const counter = preservedSignal('counter', 0);
```

## Why the Store Pattern Matters

The store pattern solves a common problem in reactive applications: **signal recreation on component re-renders**. When signals are created inside component functions, they get recreated every time the component re-renders, which:

1. **Loses State**: Previous values are discarded
2. **Causes Performance Issues**: Unnecessary signal recreation
3. **Breaks Reactivity**: New signals don't have the same subscribers
4. **Makes Testing Harder**: State logic is scattered throughout components

By moving signals to a central store:

1. **State Persistence**: Signals maintain their values across renders
2. **Better Performance**: No unnecessary recreation
3. **Centralized Logic**: All state management in one place
4. **Easier Testing**: State logic can be tested in isolation
5. **Reusable Functions**: Update functions can be shared across components

## Why Preserved Signals Matter

In component-based architectures, you often need local state that persists between renders. Without preserved signals, any signal created inside a component would be recreated on each render, making it impossible to maintain component state.

Preserved signals solve this by:

1. Using unique keys to identify signals within a component
2. Automatically managing component instances
3. Preserving signal state between renders
4. Providing a clean API that feels natural

This makes it easy to build interactive components with persistent local state!
