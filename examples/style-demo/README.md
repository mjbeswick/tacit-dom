# Style Demo - Tacit-DOM

This example demonstrates the new style functionality in Tacit-DOM, showing how to use styles in various ways:

## Features Demonstrated

### 1. Static Styles

- **String-based styles**: Using CSS strings like `'background-color: red; color: white;'`
- **Object-based styles**: Using React-like style objects with camelCase properties
- **Mixed properties**: Combining string and numeric values

### 2. Reactive Styles

- **Signal-based styles**: Styles that automatically update when signals change
- **Computed styles**: Styles computed from multiple signals
- **Interactive updates**: Buttons to change colors, sizes, and rotations

### 3. Mixed Styles with Signals

- **Individual property signals**: Signals for specific style properties
- **RGB color mixer**: Interactive color mixing with range inputs
- **Real-time updates**: Styles update as you move the sliders

## Usage Examples

```typescript
// String-based styles
div({ style: 'background-color: red; color: white;' }, 'Content');

// Object-based styles (React-like)
div(
  {
    style: {
      backgroundColor: 'red',
      color: 'white',
      fontSize: 16,
      padding: 15,
    },
  },
  'Content',
);

// Reactive styles
const colorSignal = signal('red');
div({ style: { backgroundColor: colorSignal } }, 'Content');

// Computed styles
const dynamicStyle = computed(() => ({
  backgroundColor: colorSignal.get(),
  fontSize: sizeSignal.get(),
}));
div({ style: dynamicStyle }, 'Content');
```

## Running the Demo

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open the browser to the displayed URL

## Style Property Handling

- **CamelCase to kebab-case**: Properties like `backgroundColor` are automatically converted to `background-color`
- **Automatic units**: Numeric values for properties like `fontSize` automatically get `px` units
- **Mixed types**: Support for both string and numeric values
- **Reactive updates**: Styles automatically update when signals change
- **JSDOM compatibility**: Uses `setProperty` for better test environment compatibility

## Browser Compatibility

The style functionality works in all modern browsers and is fully compatible with the Tacit-DOM testing environment (JSDOM).
