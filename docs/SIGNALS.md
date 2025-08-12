# Signals Documentation

## Overview

The Thorix library provides a reactive signal system that allows you to create reactive state and automatically update the DOM when that state changes.

## Basic Signals

### Creating Signals

```typescript
import { signal } from 'thorix';

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
count.update((prev) => prev + 1);
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

## Computed Signals

Computed signals automatically update when their dependencies change.

```typescript
import { computed } from 'thorix';

const firstName = signal('John');
const lastName = signal('Doe');

const fullName = computed(() => {
  return firstName.get() + ' ' + lastName.get();
});

console.log(fullName.get()); // "John Doe"

firstName.set('Jane');
console.log(fullName.get()); // "Jane Doe"
```

## Effects

Effects run side effects when their dependencies change.

```typescript
import { effect } from 'thorix';

const count = signal(0);

effect(() => {
  console.log('Count is now:', count.get());
});

count.set(5); // Logs: "Count is now: 5"
```

## Mount Effects

The `mount` function provides a convenient way to set up resources when a component first mounts and automatically clean them up when the component unmounts.

```typescript
import { mount } from 'thorix';

function TimerComponent() {
  const count = signal(0);

  mount(() => {
    const interval = setInterval(() => {
      count.set(count.get() + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [count]);

  return div(`Count: ${count.get()}`);
}
```

### When to Use Mount

- **Timers and Intervals**: `setInterval`, `setTimeout`
- **Event Listeners**: Global event listeners, WebSocket connections
- **Third-party Libraries**: Initializing libraries that need cleanup
- **Resource Management**: Any resource that needs to be cleaned up

### How It Works

1. **First Run**: The mount function runs once when the component first renders
2. **Dependency Tracking**: It tracks the specified signals/computed values
3. **Automatic Cleanup**: When the component unmounts, cleanup functions are automatically called
4. **No Manual Management**: No need to remember to call cleanup functions

### Example with Multiple Resources

```typescript
function ChatComponent() {
  const messages = signal<string[]>([]);
  const isConnected = signal(false);

  mount(() => {
    // Set up WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => isConnected.set(true);
    ws.onmessage = (event) => {
      messages.update((prev) => [...prev, event.data]);
    };

    // Set up heartbeat timer
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 30000);

    // Return cleanup function
    return () => {
      ws.close();
      clearInterval(heartbeat);
    };
  }, [messages, isConnected]);

  return div(
    div(
      { className: isConnected.get() ? 'connected' : 'disconnected' },
      isConnected.get() ? 'Connected' : 'Disconnected',
    ),
    div(messages.get().map((msg) => div(msg))),
  );
}
```

## Signal Preservation

When used inside components, signals can optionally preserve their state between renders by providing a unique key.

### The Problem

```typescript
const app = () => {
  // This signal is recreated on every render
  const count = signal(0);

  return div(button({ onclick: () => count.set(count.get() + 1) }, count));
};
```

In this example, the `count` signal is recreated every time the component renders, so the counter never increments.

### The Solution: Signal with Key

```typescript
const app = () => {
  // This signal preserves its state between renders
  const count = signal(0, 'count');

  return div(button({ onclick: () => count.set(count.get() + 1) }, count));
};
```

### How Signal Preservation Works

1. **Optional Key Parameter**: Pass a unique key as the second parameter to `signal()`
2. **Component Context Detection**: The signal automatically detects if it's being used in a component context
3. **State Persistence**: Signals with the same key maintain their state between renders
4. **Backward Compatibility**: Signals without keys work exactly as before

### Multiple Preserved Signals

```typescript
const app = () => {
  const count = signal(0, 'count');
  const name = signal('John', 'name');
  const isVisible = signal(true, 'visible');

  return div(
    button({ onclick: () => count.set(count.get() + 1) }, count),
    input({ value: name, oninput: (e) => name.set(e.target.value) }),
    button(
      { onclick: () => isVisible.set(!isVisible.get()) },
      isVisible.get() ? 'Hide' : 'Show',
    ),
  );
};
```

### When to Use Keys

- **Use keys** for component-local state that needs to persist between renders
- **Don't use keys** for global signals or temporary values
- **Don't use keys** when you want the signal to be recreated on each render

### Best Practices

1. **Use descriptive keys**: Choose meaningful keys that describe the signal's purpose
2. **Keep keys unique**: Each signal in a component should have a different key
3. **Use for component state**: Signals with keys are perfect for component-local state
4. **Combine with computed**: Use preserved signals with computed signals for derived state

```typescript
const app = () => {
  const firstName = signal('John', 'firstName');
  const lastName = signal('Doe', 'lastName');

  const fullName = computed(() => {
    return firstName.get() + ' ' + lastName.get();
  });

  return div(
    input({ value: firstName, oninput: (e) => firstName.set(e.target.value) }),
    input({ value: lastName, oninput: (e) => lastName.set(e.target.value) }),
    p('Full name: ', fullName),
  );
};
```

## Batching Updates

Use the `batch` function to group multiple signal updates together.

```typescript
import { batch } from 'thorix';

const firstName = signal('John');
const lastName = signal('Doe');

// Updates are batched together
batch(() => {
  firstName.set('Jane');
  lastName.set('Smith');
});
```

## Debug Mode

Enable debug mode to see effect execution logs.

```typescript
import { setDebugMode } from 'thorix';

setDebugMode(true);
```

## Complete Example

```typescript
import {
  div,
  button,
  input,
  p,
  signal,
  computed,
  effect,
  render,
} from 'thorix';

const app = () => {
  const count = signal(0, 'count');
  const name = signal('', 'name');

  const greeting = computed(() => {
    return name.get() ? `Hello, ${name.get()}!` : 'Please enter your name';
  });

  effect(() => {
    console.log('Count changed to:', count.get());
  });

  return div(
    h1('Unified Signals Example'),
    div(
      input({
        placeholder: 'Enter your name',
        value: name,
        oninput: (e) => name.set(e.target.value),
      }),
    ),
    div(
      button(
        { onclick: () => count.set(count.get() + 1) },
        'Increment (',
        count,
        ')',
      ),
    ),
    p(greeting),
  );
};

render(app, document.getElementById('app')!);
```

This example demonstrates how signals with keys maintain their state between renders, allowing you to build interactive components with persistent local state.
