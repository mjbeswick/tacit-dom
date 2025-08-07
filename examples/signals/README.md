# Domitor Signals Example

This example demonstrates the reactive signals system in Domitor, showing how signals and computed values work together to create reactive UIs.

## Features Demonstrated

- **Global Signals**: `signalA` and `signalB` are global signals that can be accessed from anywhere
- **Computed Signals**: `signalC` and `signalD` are computed values that automatically update when their dependencies change
- **Local Signals**: `signalE` and `signalF` are created inside the component function
- **Reactive Updates**: The UI automatically updates when signals change

## How It Works

1. **Global Signals**: `signalA` and `signalB` start at 0
2. **Computed Signals**: `signalC` and `signalD` compute `signalA.get() + signalB.get()`
3. **Local Signals**: `signalE` is a local signal, and `signalF` computes `signalE.get() + 1`
4. **Event Handlers**: Clicking buttons updates the respective signals
5. **Automatic Updates**: The UI automatically reflects changes in real-time

## Running the Example

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Key Concepts

- **Signals**: Reactive state containers that can be read and written
- **Computed**: Derived values that automatically track dependencies
- **Reactivity**: Changes to signals automatically update the UI
- **Local vs Global**: Signals can be created globally or locally within components

## Console Output

Watch the browser console to see when computed values are recalculated:

- `computed signalC` - when signalC is recalculated
- `computed signalD` - when signalD is recalculated
- `computed signalF` - when signalF is recalculated
- `clicked` - when buttons are clicked

This demonstrates the automatic dependency tracking and reactive updates that make Domitor powerful for building dynamic UIs.
