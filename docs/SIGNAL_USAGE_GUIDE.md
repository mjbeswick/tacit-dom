# Tacit-DOM Signal Usage Guide

This guide explains how to properly use signals in Tacit-DOM to create reactive user interfaces.

## The Problem

Many developers try to use signals in string templates like this:

```typescript
// ❌ This doesn't work!
`Random Number: ${randomNumber.get()}`;
span(`Count: ${countSignal.get()}`);
'Hello ' + nameSignal.get();
```

**Why this doesn't work:** When you use `signal.get()` in a string template, JavaScript evaluates the expression immediately and creates a static string. The DOM element never knows about the signal, so it can't update when the signal changes.

## ✅ The Solution: Use `reactiveText`

Tacit-DOM provides a `reactiveText` function specifically for this purpose:

```typescript
import { reactiveText, signal, div } from 'tacit-dom';

const count = signal(0);

// ✅ This works perfectly!
const element = reactiveText('Current count: {}', count);

// When count changes, the text updates automatically
count.set(5); // Text becomes "Current count: 5"
```

## How `reactiveText` Works

1. **Template String**: Use `{}` as placeholders for signals
2. **Signal Arguments**: Pass signals as additional arguments
3. **Automatic Updates**: The text updates whenever any signal changes
4. **Efficient**: Only updates the DOM when values actually change

## Examples

### Single Signal

```typescript
const name = signal('World');
reactiveText('Hello, {}!', name);
```

### Multiple Signals

```typescript
const firstName = signal('John');
const lastName = signal('Doe');
const age = signal(30);

reactiveText('{} {} is {} years old', firstName, lastName, age);
```

### Mixed Content

```typescript
const temperature = signal(72);
const unit = signal('Fahrenheit');

reactiveText('The temperature is {} degrees {}', temperature, unit);
```

## Alternative Approaches

### 1. Direct Signal Children

```typescript
// ✅ Simple and effective
span('Count: ', countSignal);
div('Hello ', nameSignal, '!');
```

### 2. Computed Values

```typescript
// ✅ Good for derived state
const greeting = computed(() => `Hello, ${nameSignal.get()}!`);
span(greeting);
```

### 3. Mixed Approach

```typescript
// ✅ Flexible layout
span('Current count is: ', countSignal, ' (doubled: ', doubledSignal, ')');
```

## Best Practices

1. **Use `reactiveText` for text interpolation** - It's designed for this purpose
2. **Keep templates simple** - Use `{}` placeholders, not complex expressions
3. **Pass signals directly** - Good for simple cases
4. **Use computed values** - For complex formatting or derived state
5. **Avoid string templates with `.get()`** - They won't be reactive

## Common Patterns

### Counter Component

```typescript
function Counter() {
  const count = signal(0);

  return div(
    reactiveText('Count: {}', count),
    button({ onclick: () => count.set(count.get() + 1) }, 'Increment'),
  );
}
```

### Form Display

```typescript
function UserInfo() {
  const name = signal('');
  const email = signal('');

  return div(reactiveText('Name: {}', name), reactiveText('Email: {}', email));
}
```

### Dynamic Lists

```typescript
function TodoList() {
  const todos = signal(['Learn Tacit-DOM', 'Build app', 'Deploy']);

  return div(
    reactiveText('You have {} todos', todos),
    // ... rest of list
  );
}
```

## Troubleshooting

### Text Not Updating

- Make sure you're using `reactiveText` or passing signals directly
- Check that you're not using string templates with `.get()`
- Verify signals are properly imported and created

### Too Many/Few Placeholders

- The number of `{}` placeholders must match the number of signals
- Check for typos in your template string
- Use the console warning to debug

### Performance Issues

- `reactiveText` is optimized for performance
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
reactiveText('Count: {}', countSignal);
reactiveText('Hello {}, you are {} years old', nameSignal, ageSignal);
```

## Summary

- ❌ **Don't use**: String templates with `signal.get()`
- ✅ **Do use**: `reactiveText` function for text interpolation
- ✅ **Also good**: Direct signal children and computed values
- 🎯 **Best practice**: Use `reactiveText` for most text interpolation needs

The `reactiveText` function is the recommended way to create reactive text content in Tacit-DOM. It's simple, efficient, and designed specifically for this purpose.
