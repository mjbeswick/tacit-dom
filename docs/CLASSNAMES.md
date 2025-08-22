# ClassName Documentation

## Overview

The `className` prop is the **recommended way** to handle CSS classes in Tacit-DOM. It provides a flexible way to conditionally join CSS class names together directly on DOM elements, similar to popular libraries like `clsx` or `classnames`.

## Why Use className?

1. **More powerful**: Handles objects, arrays, and conditional logic
2. **Consistent API**: Single prop for all class name scenarios
3. **Cleaner syntax**: No need to wrap in `className()` function
4. **Future-proof**: This is the direction Tacit-DOM is heading
5. **Better performance**: Single prop processing

## Basic Usage

Instead of calling a function, you pass the class names directly to the `classNames` prop:

```typescript
import { div, button } from 'tacit-dom';

// Simple string concatenation
div({ className: ['foo', 'bar', 'baz'] }); // 'foo bar baz'

// Single class
div({ className: 'button' }); // 'button'

// Empty result
div({ className: [] }); // ''
```

## Input Types

The `classNames` prop accepts various input types:

### Strings

```typescript
div({ className: 'foo' }); // 'foo'
div({ className: ['foo', 'bar'] }); // 'foo bar'
div({ className: '' }); // ''
```

### Numbers

```typescript
div({ className: [1, 2, 3] }); // '1 2 3'
div({ className: 0 }); // '' (falsy values are ignored)
div({ className: [-1, -2] }); // '-1 -2'
```

### Booleans

```typescript
div({ className: [true, false, 'foo'] }); // 'foo'
div({ className: [true, false] }); // '' (all falsy)
```

### Null and Undefined

```typescript
div({ className: [null, undefined, 'foo'] }); // 'foo'
div({ className: [null, undefined] }); // ''
```

### Objects

Objects use keys as class names when values are truthy:

```typescript
div({
  className: {
    button: true,
    primary: true,
    disabled: false,
  },
}); // 'button primary'

div({
  className: {
    active: true,
    hidden: false,
    visible: true,
  },
}); // 'active visible'

// Empty object
div({ className: {} }); // ''

// All falsy values
div({
  className: {
    foo: false,
    bar: null,
    baz: undefined,
  },
}); // ''
```

### Arrays

Arrays are processed recursively:

```typescript
div({ className: [['foo', 'bar'], 'baz'] }); // 'foo bar baz'

// Nested arrays
div({ className: [['foo', ['bar', 'baz']], 'qux'] }); // 'foo bar baz qux'

// Arrays with mixed types
div({
  className: [['foo', { bar: true, baz: false }, 'qux']],
}); // 'foo bar qux'

// Empty arrays
div({ className: [[], 'foo'] }); // ' foo'
```

## Advanced Examples

### Conditional Classes

```typescript
const isActive = true;
const isDisabled = false;
const size = 'large';

div({
  className: ['button', { active: isActive }, { disabled: isDisabled }, size],
}); // 'button active large'
```

### Dynamic Classes with Signals

```typescript
import { signal, div } from 'tacit-dom';

const isVisible = signal(true);
const theme = signal('dark');

const className = ['container', { visible: isVisible.get() }, `theme-${theme.get()}`];

div({ className: className }); // 'container visible theme-dark'
```

### Complex Conditional Logic

```typescript
const user = { role: 'admin', isOnline: true };
const page = 'dashboard';

div({
  className: [
    'user-card',
    { admin: user.role === 'admin' },
    { online: user.isOnline },
    { offline: !user.isOnline },
    `page-${page}`,
  ],
}); // 'user-card admin online page-dashboard'
```

### Component State Classes

```typescript
const app = () => {
  const isLoading = signal(false);
  const hasError = signal(false);
  const isSuccess = signal(true);

  return div(
    {
      className: ['form', { loading: isLoading.get() }, { error: hasError.get() }, { success: isSuccess.get() }],
    },
    'Form content',
  );
};
```

### Responsive Classes

```typescript
const isMobile = signal(true);
const isTablet = signal(false);
const isDesktop = signal(false);

div({
  className: ['layout', { mobile: isMobile.get() }, { tablet: isTablet.get() }, { desktop: isDesktop.get() }],
}); // 'layout mobile'
```

### Theme and Variant Classes

```typescript
const theme = signal('dark');
const variant = signal('primary');
const size = signal('medium');

div({
  className: ['button', `theme-${theme.get()}`, `variant-${variant.get()}`, `size-${size.get()}`],
}); // 'button theme-dark variant-primary size-medium'
```

### Form Validation Classes

```typescript
const isValid = signal(true);
const isDirty = signal(false);
const hasError = signal(false);

div({
  className: [
    'input',
    { valid: isValid.get() },
    { invalid: !isValid.get() },
    { dirty: isDirty.get() },
    { error: hasError.get() },
  ],
}); // 'input valid'
```

### Navigation Classes

```typescript
const currentPage = signal('home');
const pages = ['home', 'about', 'contact'];

div({
  className: ['nav-item', { active: currentPage.get() === 'home' }, { current: true }],
}); // 'nav-item active current'
```

### Loading States

```typescript
const isLoading = signal(true);
const isSaving = signal(false);
const isDeleting = signal(false);

div({
  className: ['spinner', { loading: isLoading.get() }, { saving: isSaving.get() }, { deleting: isDeleting.get() }],
}); // 'spinner loading'
```

### Utility Classes

```typescript
const isHidden = signal(false);
const isCentered = signal(true);
const isResponsive = signal(true);

div({
  className: [
    'container',
    { hidden: isHidden.get() },
    { centered: isCentered.get() },
    { responsive: isResponsive.get() },
  ],
}); // 'container centered responsive'
```

## Best Practices

### 1. Use Descriptive Class Names

```typescript
// Good
div({ className: ['user-profile', { active: isActive }] });

// Avoid
div({ className: ['up', { a: isActive }] });
```

### 2. Group Related Classes

```typescript
// Good
div({
  className: ['button', 'primary', { disabled: isDisabled }, { loading: isLoading }],
});

// Avoid
div({ className: ['button', 'primary', 'disabled', 'loading'] });
```

### 3. Use Objects for Conditional Classes

```typescript
// Good
div({
  className: ['button', { active: isActive, disabled: isDisabled }],
});

// Avoid
div({
  className: ['button', isActive ? 'active' : '', isDisabled ? 'disabled' : ''],
});
```

### 4. Combine with Signals for Reactive Classes

```typescript
const isVisible = signal(true);
const theme = signal('dark');

// Reactive class names
const className = ['container', { visible: isVisible.get() }, `theme-${theme.get()}`];

div({ className: className });
```

### 5. Use for Component Props

```typescript
const Button = ({ variant, size, disabled, children }) => {
  return button(
    {
      className: ['button', `button--${variant}`, `button--${size}`, { 'button--disabled': disabled }],
    },
    children,
  );
};
```

## Integration with Tacit-DOM

The `classNames` prop integrates seamlessly with Tacit-DOM's reactive system:

```typescript
import { signal, computed, div, button } from 'tacit-dom';

const app = () => {
  const isActive = signal(false);
  const theme = signal('light');

  const buttonClasses = computed(() => ['button', { active: isActive.get() }, `theme-${theme.get()}`]);

  return div(
    button(
      {
        className: buttonClasses,
        onclick: () => isActive.set(!isActive.get()),
      },
      'Toggle Active',
    ),
  );
};
```

## CSS Modules Integration

Tacit-DOM supports CSS Modules, and the `classNames` prop works perfectly with scoped class names:

### Basic CSS Modules Usage

```typescript
import styles from './Button.module.css';

const Button = ({ variant, disabled, children }) => {
  return button(
    {
      className: [styles.button, styles[`button--${variant}`], { [styles['button--disabled']]: disabled }],
    },
    children,
  );
};
```

### CSS Modules with Conditional Classes

```typescript
import styles from './Form.module.css';

const FormInput = ({ isValid, isDirty, error }) => {
  return input({
    className: [
      styles.input,
      { [styles.valid]: isValid },
      { [styles.invalid]: !isValid },
      { [styles.dirty]: isDirty },
      { [styles.error]: error },
    ],
  });
};
```

### CSS Modules with Signals

```typescript
import styles from './Component.module.css';

const app = () => {
  const isVisible = signal(true);
  const theme = signal('dark');

  const containerClasses = computed(() => [
    styles.container,
    { [styles.visible]: isVisible.get() },
    { [styles.hidden]: !isVisible.get() },
    styles[`theme--${theme.get()}`],
  ]);

  return div({ className: containerClasses }, 'Content');
};
```

### CSS Modules with Dynamic Classes

```typescript
import styles from './Card.module.css';

const Card = ({ size, variant, elevated }) => {
  return div({
    className: [
      styles.card,
      styles[`card--${size}`],
      styles[`card--${variant}`],
      { [styles['card--elevated']]: elevated },
    ],
  });
};
```

### CSS Modules File Example

```css
/* Button.module.css */
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button--primary {
  background: #007bff;
  color: white;
}

.button--secondary {
  background: #6c757d;
  color: white;
}

.button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### CSS Modules with Computed Values

```typescript
import styles from './Component.module.css';

const app = () => {
  const isLoading = signal(false);
  const hasError = signal(false);

  const wrapperClasses = computed(() => [
    styles.wrapper,
    { [styles.loading]: isLoading.get() },
    { [styles.error]: hasError.get() },
    { [styles.success]: !isLoading.get() && !hasError.get() },
  ]);

  return div({ className: wrapperClasses }, 'Content');
};
```

### CSS Modules Best Practices

1. **Use Bracket Notation for Dynamic Classes**

   ```typescript
   // Good
   styles[`button--${variant}`];

   // Avoid
   styles['button--' + variant];
   ```

2. **Group Related Classes**

   ```typescript
   [styles.button, styles[`button--${size}`], { [styles['button--disabled']]: disabled }];
   ```

3. **Use Computed for Complex Logic**

   ```typescript
   const buttonClasses = computed(() => [
     styles.button,
     { [styles.active]: isActive.get() },
     { [styles.loading]: isLoading.get() },
   ]);
   ```

4. **Combine with Theme System**
   ```typescript
   [styles.component, styles[`theme--${theme.get()}`], { [styles.visible]: isVisible.get() }];
   ```

## Performance Considerations

- The prop is lightweight and optimized for common use cases
- Avoid deeply nested arrays for better performance
- Consider memoizing complex class name computations with `computed`

```typescript
// Good - memoized computation
const className = computed(() => ['button', { active: isActive.get() }]);

// Avoid - recalculated on every render
const className = ['button', { active: isActive.get() }];
```

## TypeScript Support

The prop is fully typed and provides excellent TypeScript support:

```typescript
// TypeScript will infer the correct types
const classes = ['foo', { bar: true }];

// Works with union types
const variant: 'primary' | 'secondary' = 'primary';
const classes = ['button', `button--${variant}`];
```

## Key Benefits

The `className` prop is designed to be intuitive and powerful:

1. **No function call needed**: Pass arrays and objects directly
2. **Better TypeScript support**: More specific typing for class name inputs
3. **Cleaner syntax**: No need to wrap in `className()` function
4. **Consistent behavior**: Always processes the same input types

This utility makes it easy to create dynamic, conditional CSS class names in a clean and maintainable way directly on DOM elements!
