# Migration Guide: className to classNames

## Overview

The `className` prop has been deprecated in favor of the more powerful `classNames` prop. This guide will help you migrate your existing code to use the new prop.

## Why Migrate?

1. **More powerful**: `classNames` can handle everything `className` can do, plus much more
2. **Future-proof**: `className` will be removed in a future version
3. **Better performance**: Single prop processing instead of two separate handlers
4. **Consistent API**: One prop for all class name scenarios

## Migration Examples

### Simple String Classes

**Before (className):**
```typescript
div({ className: 'container' }, 'Content')
div({ className: 'btn btn-primary' }, 'Button')
```

**After (classNames):**
```typescript
div({ classNames: 'container' }, 'Content')
div({ classNames: 'btn btn-primary' }, 'Button')
```

### Conditional Classes

**Before (className with manual logic):**
```typescript
const buttonClass = isActive ? 'btn btn-active' : 'btn';
div({ className: buttonClass }, 'Button')
```

**After (classNames with object syntax):**
```typescript
div({ 
  classNames: ['btn', { 'btn-active': isActive }] 
}, 'Button')
```

### Multiple Classes

**Before (className with manual concatenation):**
```typescript
const baseClass = 'card';
const sizeClass = size === 'large' ? 'card-large' : 'card-small';
const themeClass = `theme-${theme}`;
div({ className: `${baseClass} ${sizeClass} ${themeClass}` }, 'Card')
```

**After (classNames with array syntax):**
```typescript
div({ 
  classNames: ['card', size === 'large' ? 'card-large' : 'card-small', `theme-${theme}`] 
}, 'Card')
```

### Complex Conditional Logic

**Before (className with complex logic):**
```typescript
const getButtonClasses = () => {
  const classes = ['btn'];
  if (isPrimary) classes.push('btn-primary');
  if (isDisabled) classes.push('btn-disabled');
  if (size === 'large') classes.push('btn-large');
  if (variant === 'outline') classes.push('btn-outline');
  return classes.join(' ');
};

button({ className: getButtonClasses() }, 'Button')
```

**After (classNames with object syntax):**
```typescript
button({ 
  classNames: [
    'btn',
    { 
      'btn-primary': isPrimary,
      'btn-disabled': isDisabled,
      'btn-large': size === 'large',
      'btn-outline': variant === 'outline'
    }
  ]
}, 'Button')
```

## Advanced classNames Features

### Object Syntax
```typescript
// Conditional classes based on boolean values
div({ 
  classNames: {
    'container': true,
    'hidden': isHidden,
    'active': isActive,
    'disabled': isDisabled
  }
}, 'Content')
```

### Mixed Array Syntax
```typescript
div({ 
  classNames: [
    'base-class',
    { 'conditional-class': condition },
    ['nested', 'classes'],
    dynamicClass
  ]
}, 'Content')
```

### Falsy Value Handling
```typescript
// Falsy values are automatically ignored
div({ 
  classNames: [
    'base',
    condition && 'conditional',  // Only added if condition is true
    null,                       // Ignored
    undefined,                  // Ignored
    false && 'never-added',     // Ignored
    ''                          // Ignored
  ]
}, 'Content')
```

## Migration Checklist

- [ ] Replace `className` with `classNames` in all component props
- [ ] Convert manual string concatenation to array syntax
- [ ] Replace conditional logic with object syntax where appropriate
- [ ] Test that all classes are applied correctly
- [ ] Remove any custom class name utility functions that are no longer needed

## Common Patterns

### CSS Modules
```typescript
// Before
div({ className: styles.container }, 'Content')

// After
div({ classNames: styles.container }, 'Content')
```

### Dynamic Classes
```typescript
// Before
const dynamicClass = computed(() => `theme-${theme.get()}`);
div({ className: dynamicClass.get() }, 'Content')

// After
div({ classNames: computed(() => `theme-${theme.get()}`) }, 'Content')
```

### Multiple Dynamic Classes
```typescript
// Before
const classes = computed(() => {
  const base = 'card';
  const size = sizeSignal.get();
  const theme = themeSignal.get();
  return `${base} ${base}-${size} ${base}-${theme}`;
});
div({ className: classes.get() }, 'Content')

// After
div({ 
  classNames: computed(() => [
    'card',
    `card-${sizeSignal.get()}`,
    `card-${themeSignal.get()}`
  ])
}, 'Content')
```

## Backward Compatibility

The `className` prop will continue to work during the deprecation period, but it will log a warning in development. Both props can be used together, with `classNames` taking precedence.

## Need Help?

If you encounter any issues during migration:

1. Check the [ClassNames Documentation](CLASSNAMES.md) for detailed usage examples
2. Review the [API Documentation](API.md) for the complete prop reference
3. Run your test suite to ensure all functionality works as expected
4. Check the browser console for any deprecation warnings
