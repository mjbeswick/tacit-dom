# Signals Example

This example demonstrates the Domitor signal system, including the new **preserved signals** feature.

## What This Example Shows

1. **Basic Signals**: Global signals that persist across renders
2. **Computed Signals**: Derived state that updates automatically
3. **Effects**: Side effects that run when dependencies change
4. **Preserved Signals**: Component-local state that persists between renders
5. **Regular Signals**: Component-local state that gets recreated on each render

## Key Features Demonstrated

### Preserved Signals vs Regular Signals

- **Preserved Signals** (`signalD`, `counter`): Maintain their state between renders
- **Regular Signals** (`regularSignal`): Get recreated on each render, losing their state

### Interactive Elements

- **Update signals**: Changes global signals `signalA` and `signalB`
- **Re-render**: Forces a complete re-render to show the difference between preserved and regular signals
- **Increment Counter**: Demonstrates that preserved signals maintain their state

## How to Test

1. Click "Increment Counter" a few times - notice the counter increases
2. Click "Re-render" - notice that:
   - The preserved signals (`signalD`, `counter`) maintain their values
   - The regular signal (`regularSignal`) gets a new random value
3. Click "Update signals" - changes the global signals

## Code Highlights

```typescript
// Preserved signal - maintains state between renders
const signalD = preservedSignal('signalD', random());

// Regular signal - recreated on each render
const regularSignal = signal(random());

// Preserved signal for counter
const counter = preservedSignal('counter', 0);
```

## Why Preserved Signals Matter

In component-based architectures, you often need local state that persists between renders. Without preserved signals, any signal created inside a component would be recreated on each render, making it impossible to maintain component state.

Preserved signals solve this by:

1. Using unique keys to identify signals within a component
2. Automatically managing component instances
3. Preserving signal state between renders
4. Providing a clean API that feels natural

This makes it easy to build interactive components with persistent local state!
