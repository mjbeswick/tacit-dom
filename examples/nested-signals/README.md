# Two Counters with Local Signals

This example demonstrates how to create two counter components with local signals in Tacit-DOM. Each component maintains its own isolated state using local signals, showcasing proper state encapsulation and component composition.

## What This Example Shows

### 🔢 Independent Counter Components

- **2 Counter components** each with their own local `count` signal
- Different initial values demonstrate state isolation
- Operations (increment, decrement, reset) only affect the specific counter
- Console logging shows which counter is being modified

## Key Concepts Demonstrated

### Local Signal Isolation

```typescript
const Counter = component((props: { title: string; initialValue?: number }) => {
  // This signal is local to this specific Counter instance
  const count = signal(props.initialValue || 0);

  // Each Counter has its own increment function
  const increment = () => {
    count.update((prev) => prev + 1);
  };

  return div(/* ... */);
});
```

### Component Composition

- Components can be nested arbitrarily deep
- Each maintains its own local state
- Props can be passed down to configure behavior
- State changes are isolated to the component that owns the signal

### Reactive Updates

- UI automatically updates when local signals change
- No manual DOM manipulation required
- Efficient re-rendering of only affected components

## How to Run

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Open in browser:**
   The dev server will automatically open your browser to the running example.

## What to Try

1. **Test Counter Isolation:**
   - Increment/decrement different counters
   - Reset one counter - others should remain unchanged
   - Notice how each counter maintains its own state

2. **Check Console Logs:**
   - Open browser dev tools console
   - Interact with components to see state change logs
   - Observe how each component logs its own state changes

## Code Structure

- **`Counter`** - Reusable counter component with local count signal
- **`App`** - Main app component orchestrating the two counters

## Learning Points

This example teaches:

- ✅ How to create components with local signals
- ✅ Proper state encapsulation in components
- ✅ Component reusability with different props
- ✅ Nested component composition
- ✅ Independent state management across component instances
- ✅ Event handling in reactive components

The key insight is that each component instance gets its own copy of any signals defined within the component function, ensuring perfect state isolation between component instances.
