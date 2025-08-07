# ClassNames Documentation

## Overview

The `classNames` utility function provides a flexible way to conditionally join CSS class names together. It's similar to popular libraries like `clsx` or `classnames`, offering intelligent handling of various input types.

## Basic Usage

```typescript
import { classNames } from 'domitor';

// Simple string concatenation
classNames('foo', 'bar', 'baz'); // 'foo bar baz'

// Single class
classNames('button'); // 'button'

// Empty result
classNames(); // ''
```

## Input Types

The `classNames` function accepts various input types:

### Strings

```typescript
classNames('foo', 'bar'); // 'foo bar'
classNames(''); // ''
```

### Numbers

```typescript
classNames(1, 2, 3); // '1 2 3'
classNames(0); // '' (falsy values are ignored)
classNames(-1, -2); // '-1 -2'
```

### Booleans

```typescript
classNames(true, false, 'foo'); // 'foo'
classNames(true, false); // '' (all falsy)
```

### Null and Undefined

```typescript
classNames(null, undefined, 'foo'); // 'foo'
classNames(null, undefined); // ''
```

### Objects

Objects use keys as class names when values are truthy:

```typescript
classNames({
  button: true,
  primary: true,
  disabled: false,
}); // 'button primary'

classNames({
  active: true,
  hidden: false,
  visible: true,
}); // 'active visible'

// Empty object
classNames({}); // ''

// All falsy values
classNames({
  foo: false,
  bar: null,
  baz: undefined,
}); // ''
```

### Arrays

Arrays are processed recursively:

```typescript
classNames(['foo', 'bar'], 'baz'); // 'foo bar baz'

// Nested arrays
classNames(['foo', ['bar', 'baz']], 'qux'); // 'foo bar baz qux'

// Arrays with mixed types
classNames(['foo', { bar: true, baz: false }, 'qux']); // 'foo bar qux'

// Empty arrays
classNames([], 'foo'); // ' foo'
```

## Advanced Examples

### Conditional Classes

```typescript
const isActive = true;
const isDisabled = false;
const size = 'large';

classNames('button', { active: isActive }, { disabled: isDisabled }, size); // 'button active large'
```

### Dynamic Classes with Signals

```typescript
import { signal, classNames } from 'domitor';

const isVisible = signal(true);
const theme = signal('dark');

const className = classNames(
  'container',
  { visible: isVisible.get() },
  `theme-${theme.get()}`,
); // 'container visible theme-dark'
```

### Complex Conditional Logic

```typescript
const user = { role: 'admin', isOnline: true };
const page = 'dashboard';

classNames(
  'user-card',
  { admin: user.role === 'admin' },
  { online: user.isOnline },
  { offline: !user.isOnline },
  `page-${page}`,
); // 'user-card admin online page-dashboard'
```

### Component State Classes

```typescript
const app = () => {
  const isLoading = signal(false);
  const hasError = signal(false);
  const isSuccess = signal(true);

  return div(
    {
      className: classNames(
        'form',
        { loading: isLoading.get() },
        { error: hasError.get() },
        { success: isSuccess.get() },
      ),
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

classNames(
  'layout',
  { mobile: isMobile.get() },
  { tablet: isTablet.get() },
  { desktop: isDesktop.get() },
); // 'layout mobile'
```

### Theme and Variant Classes

```typescript
const theme = signal('dark');
const variant = signal('primary');
const size = signal('medium');

classNames(
  'button',
  `theme-${theme.get()}`,
  `variant-${variant.get()}`,
  `size-${size.get()}`,
); // 'button theme-dark variant-primary size-medium'
```

### Form Validation Classes

```typescript
const isValid = signal(true);
const isDirty = signal(false);
const hasError = signal(false);

classNames(
  'input',
  { valid: isValid.get() },
  { invalid: !isValid.get() },
  { dirty: isDirty.get() },
  { error: hasError.get() },
); // 'input valid'
```

### Navigation Classes

```typescript
const currentPage = signal('home');
const pages = ['home', 'about', 'contact'];

classNames(
  'nav-item',
  { active: currentPage.get() === 'home' },
  { current: true },
); // 'nav-item active current'
```

### Loading States

```typescript
const isLoading = signal(true);
const isSaving = signal(false);
const isDeleting = signal(false);

classNames(
  'spinner',
  { loading: isLoading.get() },
  { saving: isSaving.get() },
  { deleting: isDeleting.get() },
); // 'spinner loading'
```

### Utility Classes

```typescript
const isHidden = signal(false);
const isCentered = signal(true);
const isResponsive = signal(true);

classNames(
  'container',
  { hidden: isHidden.get() },
  { centered: isCentered.get() },
  { responsive: isResponsive.get() },
); // 'container centered responsive'
```

## Best Practices

### 1. Use Descriptive Class Names

```typescript
// Good
classNames('user-profile', { active: isActive });

// Avoid
classNames('up', { a: isActive });
```

### 2. Group Related Classes

```typescript
// Good
classNames(
  'button',
  'primary',
  { disabled: isDisabled },
  { loading: isLoading },
);

// Avoid
classNames('button', 'primary', 'disabled', 'loading');
```

### 3. Use Objects for Conditional Classes

```typescript
// Good
classNames('button', { active: isActive, disabled: isDisabled });

// Avoid
classNames('button', isActive ? 'active' : '', isDisabled ? 'disabled' : '');
```

### 4. Combine with Signals for Reactive Classes

```typescript
const isVisible = signal(true);
const theme = signal('dark');

// Reactive class names
const className = classNames(
  'container',
  { visible: isVisible.get() },
  `theme-${theme.get()}`,
);
```

### 5. Use for Component Props

```typescript
const Button = ({ variant, size, disabled, children }) => {
  return button(
    {
      className: classNames('button', `button--${variant}`, `button--${size}`, {
        'button--disabled': disabled,
      }),
    },
    children,
  );
};
```

## Integration with Domitor

The `classNames` function integrates seamlessly with Domitor's reactive system:

```typescript
import { signal, computed, classNames, div, button } from 'domitor';

const app = () => {
  const isActive = signal(false);
  const theme = signal('light');

  const buttonClasses = computed(() =>
    classNames('button', { active: isActive.get() }, `theme-${theme.get()}`),
  );

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

Domitor supports CSS Modules, and `classNames` works perfectly with scoped class names:

### Basic CSS Modules Usage

```typescript
import styles from './Button.module.css';

const Button = ({ variant, disabled, children }) => {
  return button(
    {
      className: classNames(styles.button, styles[`button--${variant}`], {
        [styles['button--disabled']]: disabled,
      }),
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
    className: classNames(
      styles.input,
      { [styles.valid]: isValid },
      { [styles.invalid]: !isValid },
      { [styles.dirty]: isDirty },
      { [styles.error]: error },
    ),
  });
};
```

### CSS Modules with Signals

```typescript
import styles from './Component.module.css';

const app = () => {
  const isVisible = signal(true);
  const theme = signal('dark');

  const containerClasses = computed(() =>
    classNames(
      styles.container,
      { [styles.visible]: isVisible.get() },
      { [styles.hidden]: !isVisible.get() },
      styles[`theme--${theme.get()}`],
    ),
  );

  return div({ className: containerClasses }, 'Content');
};
```

### CSS Modules with Dynamic Classes

```typescript
import styles from './Card.module.css';

const Card = ({ size, variant, elevated }) => {
  return div({
    className: classNames(
      styles.card,
      styles[`card--${size}`],
      styles[`card--${variant}`],
      { [styles['card--elevated']]: elevated },
    ),
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

  const wrapperClasses = computed(() =>
    classNames(
      styles.wrapper,
      { [styles.loading]: isLoading.get() },
      { [styles.error]: hasError.get() },
      { [styles.success]: !isLoading.get() && !hasError.get() },
    ),
  );

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
   classNames(styles.button, styles[`button--${size}`], {
     [styles['button--disabled']]: disabled,
   });
   ```

3. **Use Computed for Complex Logic**

   ```typescript
   const buttonClasses = computed(() =>
     classNames(
       styles.button,
       { [styles.active]: isActive.get() },
       { [styles.loading]: isLoading.get() },
     ),
   );
   ```

4. **Combine with Theme System**
   ```typescript
   classNames(styles.component, styles[`theme--${theme.get()}`], {
     [styles.visible]: isVisible.get(),
   });
   ```

## Performance Considerations

- The function is lightweight and optimized for common use cases
- Avoid deeply nested arrays for better performance
- Consider memoizing complex class name computations with `computed`

```typescript
// Good - memoized computation
const className = computed(() =>
  classNames('button', { active: isActive.get() }),
);

// Avoid - recalculated on every render
const className = classNames('button', { active: isActive.get() });
```

## TypeScript Support

The function is fully typed and provides excellent TypeScript support:

```typescript
// TypeScript will infer the correct return type
const classes: string = classNames('foo', { bar: true });

// Works with union types
const variant: 'primary' | 'secondary' = 'primary';
const classes = classNames('button', `button--${variant}`);
```

This utility makes it easy to create dynamic, conditional CSS class names in a clean and maintainable way!
