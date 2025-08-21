# Tacit-DOM Signal Usage Guide

This guide explains how to properly use signals in Tacit-DOM to create reactive user interfaces with the new Preact-like API.

## The Problem

Many developers try to use signals in string templates like this:

```typescript
// ❌ This doesn't work!
`Random Number: ${randomNumber.get()}`;
span(`Count: ${countSignal.get()}`);
'Hello ' + nameSignal.get();
```

**Why this doesn't work:** When you use `signal.get()` in a string template, JavaScript evaluates the expression immediately and creates a static string. The DOM element never knows about the signal, so it can't update when the signal changes.

## ✅ The Solution: Use Signals Directly as Children

Tacit-DOM automatically handles signals when they're passed as children to DOM elements:

```typescript
import { signal, component, useSignal, div, span } from 'tacit-dom';

const Counter = component(() => {
  const count = useSignal(0);

  // ✅ This works perfectly!
  return div(
    span('Current count: ', count), // Signal passed directly
    div('Doubled: ', count.get() * 2), // Computed inline
  );
});
```

## How Signal Children Work

1. **Direct Signal Passing**: Pass signals directly as children to DOM elements
2. **Automatic Updates**: The DOM automatically updates when signals change
3. **Efficient**: Only updates the DOM when values actually change
4. **Simple**: No special functions needed

## Examples

### Single Signal

```typescript
const Counter = component(() => {
  const count = useSignal(0);
  
  return div(
    span('Count: ', count), // Signal passed directly
    button({ onClick: () => count.set(count.get() + 1) }, 'Increment'),
  );
});
```

### Multiple Signals

```typescript
const UserProfile = component(() => {
  const firstName = useSignal('John');
  const lastName = useSignal('Doe');
  const age = useSignal(30);

  return div(
    span('Name: ', firstName, ' ', lastName), // Multiple signals
    span('Age: ', age), // Age signal
  );
});
```

### Mixed Content

```typescript
const WeatherWidget = component(() => {
  const temperature = useSignal(72);
  const unit = useSignal('Fahrenheit');

  return div(
    span('Temperature: ', temperature, '°', unit), // Mixed content
  );
});
```

## Alternative Approaches

### 1. Computed Values

```typescript
// ✅ Good for derived state
const UserGreeting = component(() => {
  const name = useSignal('World');
  const greeting = computed(() => `Hello, ${name.get()}!`);
  
  return span(greeting); // Computed value
});
```

### 2. Inline Computations

```typescript
// ✅ Good for simple calculations
const PriceDisplay = component(() => {
  const price = useSignal(10);
  const quantity = useSignal(2);
  
  return div(
    span('Total: $', price, ' × ', quantity, ' = $', 
      computed(() => price.get() * quantity.get())
    ),
  );
});
```

### 3. Conditional Rendering

```typescript
// ✅ Good for conditional content
const ConditionalContent = component(() => {
  const isVisible = useSignal(true);
  const message = useSignal('Hello World');
  
  return div(
    isVisible.get() ? span(message) : span('Hidden'),
  );
});
```

## Best Practices

1. **Pass signals directly as children** - It's the simplest and most efficient approach
2. **Use computed values for complex formatting** - Good for derived state
3. **Keep inline computations simple** - Avoid complex logic in render functions
4. **Use conditional rendering** - For dynamic content based on signal values
5. **Avoid string templates with `.get()`** - They won't be reactive

## Common Patterns

### Counter Component

```typescript
const Counter = component(() => {
  const count = useSignal(0);
  
  return div(
    span('Count: ', count),
    button({ onClick: () => count.set(count.get() + 1) }, 'Increment'),
  );
});
```

### Form Display

```typescript
const UserInfo = component(() => {
  const name = useSignal('');
  const email = useSignal('');
  
  return div(
    span('Name: ', name),
    span('Email: ', email),
  );
});
```

### Dynamic Lists

```typescript
const TodoList = component(() => {
  const todos = useSignal(['Learn Tacit-DOM', 'Build app', 'Deploy']);
  
  return div(
    span('You have ', todos, ' todos'),
    ul(
      ...todos.get().map((todo, index) => 
        li({ key: index }, todo)
      )
    ),
  );
});
```

## Troubleshooting

### Text Not Updating

- Make sure you're passing signals directly as children
- Check that you're not using string templates with `.get()`
- Verify signals are properly imported and created

### Performance Issues

- Passing signals directly is optimized for performance
- Only updates when values actually change
- Automatically cleans up subscriptions

## Migration Guide

If you have existing code using string templates:

### Before (Not Working)

```typescript
span(`Count: ${countSignal.get()}`);
div(`Hello ${nameSignal.get()}, you are ${ageSignal.get()} years old`);
```

### After (Working)

```typescript
span('Count: ', countSignal);
div('Hello ', nameSignal, ', you are ', ageSignal, ' years old');
```

## Advanced Patterns

### Reactive Lists

```typescript
const DynamicList = component(() => {
  const items = useSignal(['Apple', 'Banana', 'Orange']);
  
  return div(
    span('Items: ', items),
    ul(
      ...items.get().map((item, index) => 
        li({ key: index }, item)
      )
    ),
  );
});
```

### Form Validation

```typescript
const ValidatedForm = component(() => {
  const email = useSignal('');
  const isValid = computed(() => email.get().includes('@'));
  
  return div(
    input({
      value: email.get(),
      onInput: (e) => email.set((e.target as HTMLInputElement).value),
      placeholder: 'Enter email'
    }),
    span('Valid: ', isValid),
  );
});
```

### Conditional Styling

```typescript
const StatusIndicator = component(() => {
  const status = useSignal('loading');
  const isError = computed(() => status.get() === 'error');
  const isSuccess = computed(() => status.get() === 'success');
  
  return div(
    { 
      className: computed(() => 
        isError.get() ? 'error' : 
        isSuccess.get() ? 'success' : 'loading'
      )
    },
    span('Status: ', status),
  );
});
```

## Summary

- ❌ **Don't use**: String templates with `signal.get()`
- ✅ **Do use**: Pass signals directly as children to DOM elements
- ✅ **Also good**: Computed values and inline computations
- 🎯 **Best practice**: Pass signals directly for most use cases

Passing signals directly as children is the recommended way to create reactive content in Tacit-DOM. It's simple, efficient, and designed specifically for this purpose.
