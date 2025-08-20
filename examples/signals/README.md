# Signals Example

This example demonstrates Tacit-DOM's reactive signal system with a clean, generic interface that showcases the core concepts of reactive programming.

## What You'll Learn

- **Signals**: Mutable reactive values that automatically notify subscribers of changes
- **Computed Values**: Derived values that automatically recalculate when dependencies change
- **Effects**: Side effects that automatically re-run when their dependencies change
- **Component Reactivity**: How components automatically re-render when signals change
- **Async Signal Updates**: Handling asynchronous operations with loading states

## How It Works

The example creates three main signals:

1. **Signal A**: A basic counter that demonstrates synchronous updates
2. **Signal B**: A counter that supports both synchronous and asynchronous updates
3. **Local Counter**: A component-scoped signal that shows local state management

### Reactive Relationships

- **ComputedC**: Automatically calculates statistics based on Signal A and Signal B
- **Effects**: Log changes and demonstrate the reactive update cycle
- **Components**: Automatically re-render when their subscribed signals change

## Key Features Demonstrated

### Signal Updates

- Click buttons to increment signal values
- Watch the UI update in real-time
- See how computed values automatically recalculate

### Async Operations

- Signal B supports asynchronous updates with a 1-second delay
- Loading states are automatically managed
- Buttons are disabled during async operations

### Component Reactivity

- All components automatically subscribe to signals they use
- When signals change, components re-render automatically
- No manual state management or DOM manipulation required

### Local State

- The Local Counter demonstrates component-scoped signals
- Shows how signals can be used for local component state
- Demonstrates the importance of stable signal references

## Technical Implementation

### Store (`store.ts`)

- Defines the core signals and their relationships
- Implements computed values and effects
- Provides update functions for synchronous and asynchronous operations

### Components (`main.ts`)

- **SignalDisplay**: Reusable component for displaying signal values
- **ComputedDisplay**: Shows computed values with rich formatting
- **ButtonGroup**: Manages signal updates and loading states
- **App**: Root component that orchestrates the entire application

### Reactive System

- Automatic dependency tracking
- Efficient re-rendering
- Memory leak prevention with automatic cleanup

## Running the Example

```bash
cd examples/signals
npm install
npm run dev
```

Open your browser and navigate to the local development server. You'll see:

- Three signal displays showing current values
- A computed display showing combined statistics
- Buttons to update signals synchronously and asynchronously
- Real-time updates as you interact with the interface

## What to Try

1. **Click "Update Signal A"** - Watch Signal A increment and see computed values update
2. **Click "Update Signal B"** - See Signal B update synchronously
3. **Click "Update Signal B (Async)"** - Watch the loading state and async update
4. **Click "Increment Local Counter"** - See local component state in action
5. **Open the console** - Watch the reactive system log all updates

## Learning Outcomes

After exploring this example, you'll understand:

- How to create and use reactive signals
- How computed values automatically track dependencies
- How effects respond to signal changes
- How components automatically re-render
- How to handle async operations with signals
- Best practices for signal placement and component design

This example provides a solid foundation for building reactive applications with Tacit-DOM, demonstrating the power and simplicity of the reactive programming model.
