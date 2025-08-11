# ClassNames Documentation

## Overview

The `classNames` prop provides a flexible way to conditionally join CSS class names together directly on DOM elements. It's similar to popular libraries like `clsx` or `classnames`, offering intelligent handling of various input types without needing to call a separate function.

## Basic Usage

Instead of calling a function, you pass the class names directly to the `classNames` prop:

```typescript
import { div, button } from 'thorix';

// Simple string concatenation
div({ classNames: ['foo', 'bar', 'baz'] }); // 'foo bar baz'

// Single class
div({ classNames: 'button' }); // 'button'

// Empty result
div({ classNames: [] }); // ''
```

## Input Types

The `classNames` prop accepts various input types:

### Strings

```typescript
div({ classNames: 'foo' }); // 'foo'
div({ classNames: ['foo', 'bar'] }); // 'foo bar'
div({ classNames: '' }); // ''
```

### Numbers

```typescript
div({ classNames: [1, 2, 3] }); // '1 2 3'
div({ classNames: 0 }); // '' (falsy values are ignored)
div({ classNames: [-1, -2] }); // '-1 -2'
```

### Booleans

```typescript
div({ classNames: [true, false, 'foo'] }); // 'foo'
div({ classNames: [true, false] }); // '' (all falsy)
```

### Null and Undefined

```typescript
div({ classNames: [null, undefined, 'foo'] }); // 'foo'
div({ classNames: [null, undefined] }); // ''
```

### Objects

Objects use keys as class names when values are truthy:

```typescript
div({
  classNames: {
    button: true,
    primary: true,
    disabled: false,
  },
}); // 'button primary'

div({
  classNames: {
    active: true,
    hidden: false,
    visible: true,
  },
}); // 'active visible'

// Empty object
div({ classNames: {} }); // ''

// All falsy values
div({
  classNames: {
    foo: false,
    bar: null,
    baz: undefined,
  },
}); // ''
```

### Arrays

Arrays are processed recursively:

```typescript
div({ classNames: [['foo', 'bar'], 'baz'] }); // 'foo bar baz'

// Nested arrays
div({ classNames: [['foo', ['bar', 'baz']], 'qux'] }); // 'foo bar baz qux'

// Arrays with mixed types
div({
  classNames: [['foo', { bar: true, baz: false }, 'qux']],
}); // 'foo bar qux'

// Empty arrays
div({ classNames: [[], 'foo'] }); // ' foo'
```

## Advanced Examples

### Conditional Classes

```typescript
const isActive = true;
const isDisabled = false;
const size = 'large';

div({
  classNames: ['button', { active: isActive }, { disabled: isDisabled }, size],
}); // 'button active large'
```

### Dynamic Classes with Signals

```typescript
import { signal, div } from 'thorix';

const isVisible = signal(true);
const theme = signal('dark');

const className = [
  'container',
  { visible: isVisible.get() },
  `theme-${theme.get()}`,
];

div({ classNames: className }); // 'container visible theme-dark'
```

### Complex Conditional Logic

```typescript
const user = { role: 'admin', isOnline: true };
const page = 'dashboard';

div({
  classNames: [
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
      classNames: [
        'form',
        { loading: isLoading.get() },
        { error: hasError.get() },
        { success: isSuccess.get() },
      ],
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
  classNames: [
    'layout',
    { mobile: isMobile.get() },
    { tablet: isTablet.get() },
    { desktop: isDesktop.get() },
  ],
}); // 'layout mobile'
```

### Theme and Variant Classes

```typescript
const theme = signal('dark');
const variant = signal('primary');
const size = signal('medium');

div({
  classNames: [
    'button',
    `theme-${theme.get()}`,
    `variant-${variant.get()}`,
    `size-${size.get()}`,
  ],
}); // 'button theme-dark variant-primary size-medium'
```

### Form Validation Classes

```typescript
const isValid = signal(true);
const isDirty = signal(false);
const hasError = signal(false);

div({
  classNames: [
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
  classNames: [
    'nav-item',
    { active: currentPage.get() === 'home' },
    { current: true },
  ],
}); // 'nav-item active current'
```

### Loading States

```typescript
const isLoading = signal(true);
const isSaving = signal(false);
const isDeleting = signal(false);

div({
  classNames: [
    'spinner',
    { loading: isLoading.get() },
    { saving: isSaving.get() },
    { deleting: isDeleting.get() },
  ],
}); // 'spinner loading'
```

### Utility Classes

```typescript
const isHidden = signal(false);
const isCentered = signal(true);
const isResponsive = signal(true);

div({
  classNames: [
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
div({ classNames: ['user-profile', { active: isActive }] });

// Avoid
div({ classNames: ['up', { a: isActive }] });
```

### 2. Group Related Classes

```typescript
// Good
div({
  classNames: [
    'button',
    'primary',
    { disabled: isDisabled },
    { loading: isLoading },
  ],
});

// Avoid
div({ classNames: ['button', 'primary', 'disabled', 'loading'] });
```

### 3. Use Objects for Conditional Classes

```typescript
// Good
div({
  classNames: ['button', { active: isActive, disabled: isDisabled }],
});

// Avoid
div({
  classNames: [
    'button',
    isActive ? 'active' : '',
    isDisabled ? 'disabled' : '',
  ],
});
```

### 4. Combine with Signals for Reactive Classes

```typescript
const isVisible = signal(true);
const theme = signal('dark');

// Reactive class names
const className = [
  'container',
  { visible: isVisible.get() },
  `theme-${theme.get()}`,
];

div({ classNames: className });
```

### 5. Use for Component Props

```typescript
const Button = ({ variant, size, disabled, children }) => {
  return button(
    {
      classNames: [
        'button',
        `button--${variant}`,
        `button--${size}`,
        { 'button--disabled': disabled },
      ],
    },
    children,
  );
};
```

## Integration with Thorix

The `classNames` prop integrates seamlessly with Thorix's reactive system:

```typescript
import { signal, computed, div, button } from 'thorix';

const app = () => {
  const isActive = signal(false);
  const theme = signal('light');

  const buttonClasses = computed(() => [
    'button',
    { active: isActive.get() },
    `theme-${theme.get()}`,
  ]);

  return div(
    button(
      {
        classNames: buttonClasses,
        onclick: () => isActive.set(!isActive.get()),
      },
      'Toggle Active',
    ),
  );
};
```

## CSS Modules Integration

Thorix supports CSS Modules, and the `classNames` prop works perfectly with scoped class names:

### Basic CSS Modules Usage

```typescript
import styles from './Button.module.css';

const Button = ({ variant, disabled, children }) => {
  return button(
    {
      classNames: [
        styles.button,
        styles[`button--${variant}`],
        { [styles['button--disabled']]: disabled },
      ],
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
    classNames: [
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

  return div({ classNames: containerClasses }, 'Content');
};
```

### CSS Modules with Dynamic Classes

```typescript
import styles from './Card.module.css';

const Card = ({ size, variant, elevated }) => {
  return div({
    classNames: [
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

  return div({ classNames: wrapperClasses }, 'Content');
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
   [
     styles.button,
     styles[`button--${size}`],
     { [styles['button--disabled']]: disabled },
   ];
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
   [
     styles.component,
     styles[`theme--${theme.get()}`],
     { [styles.visible]: isVisible.get() },
   ];
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

## Key Differences from className

The `classNames` prop is designed to be more intuitive than the `className` prop:

1. **No function call needed**: Pass arrays and objects directly
2. **Better TypeScript support**: More specific typing for class name inputs
3. **Cleaner syntax**: No need to wrap in `classNames()` function
4. **Consistent behavior**: Always processes the same input types

This utility makes it easy to create dynamic, conditional CSS class names in a clean and maintainable way directly on DOM elements!
