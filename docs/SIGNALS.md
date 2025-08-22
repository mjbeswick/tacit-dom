# Signals Documentation

## Overview

The Tacit-DOM library provides a reactive signal system that allows you to create reactive state and automatically update the DOM when that state changes. This is a complete rewrite that works like Preact/React with automatic component re-rendering.

## Basic Signals

### Creating Signals

```typescript
import { signal } from 'tacit-dom';

// Create a signal with an initial value
const count = signal(0);
const name = signal('John');
const isVisible = signal(true);
```

### Reading and Writing Signals

```typescript
// Read the current value
console.log(count.get()); // 0

// Set a new value
count.set(5);
console.log(count.get()); // 5

// Update based on previous value
await count.update((prev) => prev + 1);
console.log(count.get()); // 6
```

### Subscribing to Changes

```typescript
// Subscribe to changes
const unsubscribe = count.subscribe(() => {
  console.log('Count changed to:', count.get());
});

// Later, unsubscribe
unsubscribe();
```

## Async Updates

The `update` method supports both synchronous and asynchronous update functions. When using an async function, `update` returns a Promise that resolves when the update is complete.

```typescript
// Synchronous update
await count.update((prev) => prev + 1);

// Asynchronous update with API call
await count.update(async (prev) => {
  const response = await fetch('/api/increment', {
    method: 'POST',
    body: JSON.stringify({ value: prev }),
  });
  const data = await response.json();
  return data.newValue;
});

// Asynchronous update with delay
await count.update(async (prev) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return prev * 2;
});
```

**Note**: Always use `await` when calling `update`, even for synchronous operations, as the method now returns a Promise.

### Pending State

Signals have a `pending` property that indicates whether any updates are currently in progress. This property is **reactive**, meaning it automatically triggers effects and component re-renders when the pending state changes. This is particularly useful for UI state management:

```typescript
const count = signal(0);

// Check pending state
console.log(count.pending); // false

// Start async update
const updatePromise = count.update(async (prev) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return prev + 1;
});

console.log(count.pending); // true

// Wait for update to complete
await updatePromise;
console.log(count.pending); // false
```

**Common use cases:**

- Show loading spinners during updates
- Disable buttons while operations are in progress
- Display progress indicators
- Prevent multiple simultaneous updates

## Computed Values

### Creating Computed Values

Computed values are derived from signals and automatically update when their dependencies change:

```typescript
import { signal, computed } from 'tacit-dom';

const firstName = signal('John');
const lastName = signal('Doe');

// Computed value that automatically updates
const fullName = computed(() => `${firstName.get()} ${lastName.get()}`);
const initials = computed(() => `${firstName.get()[0]}${lastName.get()[0]}`);

console.log(fullName.get()); // "John Doe"
console.log(initials.get()); // "JD"

// When dependencies change, computed values update automatically
firstName.set('Jane');
console.log(fullName.get()); // "Jane Doe"
console.log(initials.get()); // "JD"
```

### Computed Values with Multiple Dependencies

```typescript
const a = signal(1);
const b = signal(2);
const c = signal(3);

// Computed value that depends on multiple signals
const sum = computed(() => a.get() + b.get() + c.get());
const average = computed(() => sum.get() / 3);
const product = computed(() => a.get() * b.get() * c.get());

console.log(sum.get()); // 6
console.log(average.get()); // 2
console.log(product.get()); // 6

// Update one signal
a.set(5);
console.log(sum.get()); // 10
console.log(average.get()); // 3.33...
console.log(product.get()); // 30
```

### Computed Values in Components

When used in components, computed values automatically trigger re-renders when their dependencies change:

```typescript
import { component, useSignal, computed, div, button } from 'tacit-dom';

const UserProfile = component(() => {
  const firstName = useSignal('John');
  const lastName = useSignal('Doe');

  // These computed values will automatically update the UI
  const fullName = computed(() => `${firstName.get()} ${lastName.get()}`);
  const initials = computed(() => `${firstName.get()[0]}${lastName.get()[0]}`);

  return div(
    div(`Full Name: ${fullName.get()}`),
    div(`Initials: ${initials.get()}`),
    button(
      {
        onClick: () => firstName.set('Jane'),
      },
      'Change First Name',
    ),
  );
});
```

## Effects

### Basic Effects

Effects run side effects and automatically re-execute when dependencies change:

```typescript
import { signal, effect } from 'tacit-dom';

const count = signal(0);

// Effect that runs whenever count changes
const cleanup = effect(() => {
  console.log('Count changed to:', count.get());

  // Return cleanup function (optional)
  return () => {
    console.log('Cleaning up effect');
  };
});

// Later, dispose of the effect
cleanup();
```

### Effects with Cleanup

Effects can return cleanup functions that run before the effect re-runs or when the effect is disposed:

```typescript
const count = signal(0);

const cleanup = effect(() => {
  console.log('Setting up effect for count:', count.get());

  // Set up an interval
  const interval = setInterval(() => {
    console.log('Current count:', count.get());
  }, 1000);

  // Return cleanup function
  return () => {
    console.log('Cleaning up effect');
    clearInterval(interval);
  };
});

// When count changes, cleanup runs first, then the effect runs again
count.set(5);

// When disposing, cleanup runs one final time
cleanup();
```

### Effects in Components

Effects automatically clean up when components unmount, making them perfect for component lifecycle management:

```typescript
import { component, useSignal, effect, div, button } from 'tacit-dom';

const Timer = component(() => {
  const count = useSignal(0);

  // Effect that sets up a timer
  effect(() => {
    const interval = setInterval(() => {
      count.set(count.get() + 1);
    }, 1000);

    // Cleanup runs when component unmounts or effect re-runs
    return () => clearInterval(interval);
  });

  return div(
    div(`Timer: ${count.get()}`),
    button(
      {
        onClick: () => count.set(0),
      },
      'Reset',
    ),
  );
});
```

## Batching Updates

### Why Batch Updates?

Batching multiple signal updates prevents unnecessary re-renders and effects from running multiple times:

```typescript
import { signal, batch, effect } from 'tacit-dom';

const a = signal(0);
const b = signal(0);
const c = signal(0);

// Without batching - effect runs 3 times
effect(() => {
  console.log('Effect ran, values:', a.get(), b.get(), c.get());
});

a.set(1); // Effect runs
b.set(2); // Effect runs again
c.set(3); // Effect runs again

// With batching - effect runs only once
batch(() => {
  a.set(4);
  b.set(5);
  c.set(6);
}); // Effect runs once with all new values
```

### Batching in Components

Batching is particularly useful in components when updating multiple related signals:

```typescript
import { component, useSignal, batch, div, button } from 'tacit-dom';

const UserForm = component(() => {
  const firstName = useSignal('');
  const lastName = useSignal('');
  const email = useSignal('');

  const resetForm = () => {
    // Batch all updates together
    batch(() => {
      firstName.set('');
      lastName.set('');
      email.set('');
    });
  };

  const fillSampleData = () => {
    // Batch all updates together
    batch(() => {
      firstName.set('John');
      lastName.set('Doe');
      email.set('john.doe@example.com');
    });
  };

  return div(
    div(`Name: ${firstName.get()} ${lastName.get()}`),
    div(`Email: ${email.get()}`),
    button({ onClick: resetForm }, 'Reset'),
    button({ onClick: fillSampleData }, 'Fill Sample'),
  );
});
```

## Component-Scoped Signals with useSignal

### The useSignal Hook

The `useSignal` hook creates component-scoped signals that persist across re-renders:

```typescript
import { component, useSignal, div, button } from 'tacit-dom';

const Counter = component(() => {
  // This signal persists across re-renders
  const count = useSignal(0);

  return div(
    div(`Count: ${count.get()}`),
    button(
      {
        onClick: () => count.set(count.get() + 1),
      },
      'Increment',
    ),
  );
});
```

### Multiple Signals in Components

You can use multiple `useSignal` calls in a single component:

```typescript
const UserForm = component(() => {
  const name = useSignal('');
  const email = useSignal('');
  const age = useSignal(0);

  return div(
    div(`Name: ${name.get()}`),
    div(`Email: ${email.get()}`),
    div(`Age: ${age.get()}`),
    button(
      {
        onClick: () => {
          name.set('John Doe');
          email.set('john@example.com');
          age.set(30);
        },
      },
      'Fill Sample Data',
    ),
  );
});
```

### Signals vs useSignal

- **`signal()`**: Creates global signals that persist across the entire application
- **`useSignal()`**: Creates component-scoped signals that persist across component re-renders

```typescript
// Global signal - accessible everywhere
const globalCounter = signal(0);

const ComponentA = component(() => {
  // Local signal - only accessible within this component
  const localCounter = useSignal(0);

  return div(
    div(`Global: ${globalCounter.get()}`),
    div(`Local: ${localCounter.get()}`),
    button(
      {
        onClick: () => globalCounter.set(globalCounter.get() + 1),
      },
      'Increment Global',
    ),
    button(
      {
        onClick: () => localCounter.set(localCounter.get() + 1),
      },
      'Increment Local',
    ),
  );
});

const ComponentB = component(() => {
  // Can access global signal
  return div(`Global counter: ${globalCounter.get()}`);
  // Cannot access localCounter from ComponentA
});
```

## Advanced Patterns

### Derived State with Computed

```typescript
const ShoppingCart = component(() => {
  const items = useSignal([
    { name: 'Apple', price: 1.0, quantity: 2 },
    { name: 'Banana', price: 0.5, quantity: 3 },
    { name: 'Orange', price: 1.25, quantity: 1 },
  ]);

  // Computed values for derived state
  const totalItems = computed(() => items.get().reduce((sum, item) => sum + item.quantity, 0));

  const totalPrice = computed(() => items.get().reduce((sum, item) => sum + item.price * item.quantity, 0));

  const averagePrice = computed(() => totalPrice.get() / totalItems.get());

  return div(
    div(`Total Items: ${totalItems.get()}`),
    div(`Total Price: $${totalPrice.get().toFixed(2)}`),
    div(`Average Price: $${averagePrice.get().toFixed(2)}`),
  );
});
```

### Conditional Effects

```typescript
const UserProfile = component(() => {
  const user = useSignal(null);
  const isLoading = useSignal(false);

  // Effect that only runs when user changes
  effect(() => {
    const currentUser = user.get();
    if (currentUser) {
      console.log('User loaded:', currentUser.name);
      document.title = `${currentUser.name}'s Profile`;
    }
  });

  // Effect that only runs when loading state changes
  effect(() => {
    if (isLoading.get()) {
      console.log('Loading user data...');
    } else {
      console.log('User data loaded');
    }
  });

  return div(isLoading.get() ? div('Loading...') : div('User profile loaded'));
});
```

### Signal Composition

```typescript
const App = component(() => {
  const theme = useSignal('light');
  const language = useSignal('en');

  // Computed value that depends on multiple signals
  const settings = computed(() => ({
    theme: theme.get(),
    language: language.get(),
    isDark: theme.get() === 'dark',
    isEnglish: language.get() === 'en',
  }));

  // Effect that runs when settings change
  effect(() => {
    const currentSettings = settings.get();
    console.log('Settings changed:', currentSettings);

    // Apply theme
    document.body.className = currentSettings.isDark ? 'dark' : 'light';

    // Apply language
    document.documentElement.lang = currentSettings.language;
  });

  return div(
    div(`Theme: ${settings.get().theme}`),
    div(`Language: ${settings.get().language}`),
    button(
      {
        onClick: () => theme.set(theme.get() === 'light' ? 'dark' : 'light'),
      },
      'Toggle Theme',
    ),
    button(
      {
        onClick: () => language.set(language.get() === 'en' ? 'es' : 'en'),
      },
      'Toggle Language',
    ),
  );
});
```

## Performance Considerations

### Signal Optimization

- **Avoid creating signals in render functions**: Signals should be created once and reused
- **Use computed values for expensive calculations**: They only recalculate when dependencies change
- **Batch updates when possible**: Use `batch()` for multiple related signal updates
- **Clean up subscriptions**: Effects automatically clean up, but manual subscriptions should be cleaned up

### Component Optimization

- **Components automatically re-render only when needed**: No manual optimization required
- **Signals persist across re-renders**: No need to recreate signals on each render
- **Effects automatically track dependencies**: No manual subscription management needed
- **Automatic cleanup**: Effects and subscriptions are cleaned up when components unmount

### Memory Management

```typescript
const ComponentWithManualSubscription = component(() => {
  const count = useSignal(0);

  // Manual subscription (usually not needed in components)
  const unsubscribe = count.subscribe(() => {
    console.log('Count changed');
  });

  // Clean up when component unmounts
  effect(() => {
    return () => {
      unsubscribe();
    };
  });

  return div(`Count: ${count.get()}`);
});
```

## Best Practices

### 1. Use useSignal for Component State

```typescript
// ✅ Good - use useSignal for component state
const Counter = component(() => {
  const count = useSignal(0);
  return div(`Count: ${count.get()}`);
});

// ❌ Bad - don't create signals in render functions
const Counter = component(() => {
  const count = signal(0); // This recreates the signal on every render
  return div(`Count: ${count.get()}`);
});
```

### 2. Use Computed Values for Derived State

```typescript
// ✅ Good - use computed for derived state
const UserProfile = component(() => {
  const firstName = useSignal('John');
  const lastName = useSignal('Doe');
  const fullName = computed(() => `${firstName.get()} ${lastName.get()}`);

  return div(`Name: ${fullName.get()}`);
});

// ❌ Bad - don't recalculate in render
const UserProfile = component(() => {
  const firstName = useSignal('John');
  const lastName = useSignal('Doe');

  return div(`Name: ${firstName.get()} ${lastName.get()}`); // This recalculates on every render
});
```

### 3. Batch Related Updates

```typescript
// ✅ Good - batch related updates
const updateUser = () => {
  batch(() => {
    firstName.set('Jane');
    lastName.set('Smith');
    email.set('jane.smith@example.com');
  });
};

// ❌ Bad - separate updates trigger multiple effects
const updateUser = () => {
  firstName.set('Jane'); // Effect runs
  lastName.set('Smith'); // Effect runs again
  email.set('jane@example.com'); // Effect runs again
};
```

### 4. Handle Async Updates Properly

```typescript
// ✅ Good - handle async updates with pending state
const submitForm = async () => {
  await formData.update(async (prev) => {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(prev),
    });
    return await response.json();
  });
};

// Use pending state in UI
return button(
  {
    disabled: formData.pending,
    onClick: submitForm,
  },
  formData.pending ? 'Submitting...' : 'Submit',
);
```

### 5. Clean Up Effects When Needed

```typescript
// ✅ Good - return cleanup function from effects
effect(() => {
  const interval = setInterval(() => {
    count.set(count.get() + 1);
  }, 1000);

  return () => clearInterval(interval);
});

// ✅ Good - use effect for component lifecycle
effect(() => {
  // Component mounted
  console.log('Component mounted');

  return () => {
    // Component will unmount
    console.log('Component unmounting');
  };
});
```

## Troubleshooting

### Common Issues

1. **Signals not updating**: Make sure you're using `.get()` to read values and `.set()` to update them
2. **Effects running too often**: Check if you're creating new objects/arrays in render functions
3. **Memory leaks**: Effects automatically clean up, but manual subscriptions should be cleaned up
4. **Performance issues**: Use `batch()` for multiple updates and `computed` for expensive calculations

### Debugging Tips

```typescript
// Enable debug logging
const count = signal(0);

// Add logging to track signal changes
count.subscribe(() => {
  console.log('Count changed to:', count.get());
});

// Use the pending property to track async updates
effect(() => {
  console.log('Count pending:', count.pending);
});
```

## Migration from Previous Versions

### Key Changes

1. **No more manual subscriptions**: Effects automatically track dependencies
2. **No more signal keys**: `useSignal()` handles component-scoped signals automatically
3. **Simplified API**: No more `reactiveText`, etc.
4. **Automatic re-rendering**: Components automatically re-render when signals change
5. **Preact-like syntax**: Use `component()` and `useSignal()` like React hooks

### Before (Old API)

```typescript
// Old way (deprecated)
const Counter = component(() => {
  const count = signal(0, 'counter');
  return div(span(`Count: ${count.get()}`), button({ onclick: () => count.set(count.get() + 1) }, 'Increment'));
});
```

### After (New API)

```typescript
// New way
const Counter = component(() => {
  const count = useSignal(0);
  return div(div(`Count: ${count.get()}`), button({ onClick: () => count.set(count.get() + 1) }, 'Increment'));
});
```

## Summary

The new Tacit-DOM signals system provides:

- **Automatic reactivity**: Components automatically re-render when signals change
- **Component-scoped state**: Use `useSignal()` for local component state
- **Global state**: Use `signal()` for application-wide state
- **Derived state**: Use `computed()` for values that depend on other signals
- **Side effects**: Use `effect()` for DOM updates, API calls, and cleanup
- **Performance**: Automatic batching and optimization
- **Type safety**: Full TypeScript support
- **Simple API**: No manual subscription management needed

This makes building reactive applications much simpler and more intuitive, similar to modern frameworks like React and Preact.
