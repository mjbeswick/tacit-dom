# Strongly Typed Props Example

This example demonstrates the strongly typed props functionality in reactive-dom. All HTML element props are now strongly typed based on the element type, providing better TypeScript support and developer experience.

## Features Demonstrated

- **Strongly Typed Element Props**: Each HTML element has its own specific prop type
- **Form Elements**: Input, textarea, select, button with proper typing
- **Media Elements**: Image, video, audio, canvas with specific attributes
- **Interactive Elements**: Details, dialog, menu with proper event handling
- **Navigation**: Anchor elements with href, target, rel attributes
- **Reactive Props**: All props can be reactive signals or computed values

## Element Types

The following strongly typed prop types are available:

- `DivProps` - Common attributes + event handlers
- `InputProps` - Input-specific attributes (type, placeholder, etc.)
- `ButtonProps` - Button-specific attributes (type, disabled, etc.)
- `AnchorProps` - Link-specific attributes (href, target, rel, etc.)
- `ImageProps` - Image-specific attributes (src, alt, width, height, etc.)
- `VideoProps` - Video-specific attributes (src, controls, preload, etc.)
- `AudioProps` - Audio-specific attributes (src, controls, preload, etc.)
- `FormProps` - Form-specific attributes (action, method, enctype, etc.)
- `TextareaProps` - Textarea-specific attributes (rows, cols, wrap, etc.)
- `SelectProps` - Select-specific attributes (multiple, size, etc.)
- `TableProps` - Table-specific attributes (border, cellpadding, etc.)
- And many more...

## Usage

```typescript
import { input, button, a, img } from 'reactive-dom';

// Strongly typed input props
const inputElement = input({
  type: 'email',
  placeholder: 'Enter email',
  required: true,
  value: emailSignal,
  onInput: handleEmailChange,
});

// Strongly typed button props
const buttonElement = button(
  {
    type: 'submit',
    disabled: isDisabledSignal,
    onClick: handleClick,
  },
  'Submit',
);

// Strongly typed anchor props
const linkElement = a(
  {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  'External Link',
);

// Strongly typed image props
const imageElement = img({
  src: 'image.jpg',
  alt: 'Description',
  width: 300,
  height: 200,
  loading: 'lazy',
});
```

## Benefits

1. **Type Safety**: TypeScript will catch invalid props at compile time
2. **IntelliSense**: Better autocomplete and documentation in IDEs
3. **Maintainability**: Clear contracts for each element type
4. **Developer Experience**: Reduced runtime errors and better debugging

## Running the Example

```bash
cd examples/strongly-typed-props
npm install
npm run dev
```

Open your browser to `http://localhost:3000` to see the example in action.
