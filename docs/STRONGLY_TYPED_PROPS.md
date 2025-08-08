# Strongly Typed Props Implementation

This document describes the implementation of strongly typed props in the reactive-dom library.

## Overview

The reactive-dom library now provides strongly typed props for all HTML elements, replacing the previous `Record<string, any>` approach with specific type definitions for each element type.

## Implementation Details

### Type Structure

The implementation uses a modular type system with the following structure:

1. **Common Attributes** (`CommonAttributes`): Shared attributes across all elements
2. **Event Handlers** (`EventHandlers`): Typed event handlers for all events
3. **Element-Specific Attributes**: Specialized attributes for specific element types
4. **Element Props**: Union types combining common and element-specific attributes

### Type Definitions

#### Common Attributes

```typescript
type CommonAttributes = {
  id?: string | Signal<string> | Computed<string>;
  className?:
    | string
    | Signal<string>
    | Computed<string>
    | (
        | string
        | number
        | boolean
        | null
        | undefined
        | { [key: string]: any }
        | any[]
      )[];
  style?: string | Signal<string> | Computed<string>;
  title?: string | Signal<string> | Computed<string>;
  lang?: string | Signal<string> | Computed<string>;
  dir?:
    | 'ltr'
    | 'rtl'
    | 'auto'
    | Signal<'ltr' | 'rtl' | 'auto'>
    | Computed<'ltr' | 'rtl' | 'auto'>;
  hidden?: boolean | Signal<boolean> | Computed<boolean>;
  tabindex?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  accesskey?: string | Signal<string> | Computed<string>;
  contenteditable?:
    | boolean
    | 'true'
    | 'false'
    | 'inherit'
    | Signal<boolean | 'true' | 'false' | 'inherit'>
    | Computed<boolean | 'true' | 'false' | 'inherit'>;
  spellcheck?:
    | boolean
    | 'true'
    | 'false'
    | Signal<boolean | 'true' | 'false'>
    | Computed<boolean | 'true' | 'false'>;
  draggable?:
    | boolean
    | 'true'
    | 'false'
    | Signal<boolean | 'true' | 'false'>
    | Computed<boolean | 'true' | 'false'>;
  children?: ElementChildren;
};
```

#### Event Handlers

```typescript
type EventHandlers = {
  onabort?: EventHandler<Event>;
  onblur?: EventHandler<FocusEvent>;
  onchange?: EventHandler<Event>;
  onclick?: EventHandler<MouseEvent>;
  oncontextmenu?: EventHandler<MouseEvent>;
  oncopy?: EventHandler<ClipboardEvent>;
  oncut?: EventHandler<ClipboardEvent>;
  ondbclick?: EventHandler<MouseEvent>;
  ondrag?: EventHandler<DragEvent>;
  ondragend?: EventHandler<DragEvent>;
  ondragenter?: EventHandler<DragEvent>;
  ondragleave?: EventHandler<DragEvent>;
  ondragover?: EventHandler<DragEvent>;
  ondragstart?: EventHandler<DragEvent>;
  ondrop?: EventHandler<DragEvent>;
  onerror?: EventHandler<Event>;
  onfocus?: EventHandler<FocusEvent>;
  oninput?: EventHandler<Event>;
  onkeydown?: EventHandler<KeyboardEvent>;
  onkeypress?: EventHandler<KeyboardEvent>;
  onkeyup?: EventHandler<KeyboardEvent>;
  onload?: EventHandler<Event>;
  onmousedown?: EventHandler<MouseEvent>;
  onmousemove?: EventHandler<MouseEvent>;
  onmouseout?: EventHandler<MouseEvent>;
  onmouseover?: EventHandler<MouseEvent>;
  onmouseup?: EventHandler<MouseEvent>;
  onpaste?: EventHandler<ClipboardEvent>;
  onreset?: EventHandler<Event>;
  onresize?: EventHandler<UIEvent>;
  onscroll?: EventHandler<Event>;
  onselect?: EventHandler<Event>;
  onsubmit?: EventHandler<Event>;
  onunload?: EventHandler<Event>;
  onwheel?: EventHandler<WheelEvent>;
};
```

#### Element-Specific Attributes

**Input Attributes**

```typescript
type InputAttributes = FormAttributes & {
  type?:
    | 'text'
    | 'password'
    | 'email'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'month'
    | 'week'
    | 'color'
    | 'file'
    | 'range'
    | 'checkbox'
    | 'radio'
    | 'submit'
    | 'reset'
    | 'button'
    | 'image'
    | 'hidden'
    | Signal<string>
    | Computed<string>;
  placeholder?: string | Signal<string> | Computed<string>;
  size?: number | string | Signal<number | string> | Computed<number | string>;
  maxlength?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  minlength?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  pattern?: string | Signal<string> | Computed<string>;
  min?: string | number | Signal<string | number> | Computed<string | number>;
  max?: string | number | Signal<string | number> | Computed<string | number>;
  step?: string | number | Signal<string | number> | Computed<string | number>;
  multiple?: boolean | Signal<boolean> | Computed<boolean>;
  accept?: string | Signal<string> | Computed<string>;
  checked?: boolean | Signal<boolean> | Computed<boolean>;
  src?: string | Signal<string> | Computed<string>;
  alt?: string | Signal<string> | Computed<string>;
  width?: number | string | Signal<number | string> | Computed<number | string>;
  height?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
};
```

**Anchor Attributes**

```typescript
type AnchorAttributes = {
  href?: string | Signal<string> | Computed<string>;
  target?:
    | '_blank'
    | '_self'
    | '_parent'
    | '_top'
    | string
    | Signal<string>
    | Computed<string>;
  rel?: string | Signal<string> | Computed<string>;
  download?: string | Signal<string> | Computed<string>;
  hreflang?: string | Signal<string> | Computed<string>;
  type?: string | Signal<string> | Computed<string>;
};
```

**Image Attributes**

```typescript
type ImageAttributes = {
  src?: string | Signal<string> | Computed<string>;
  alt?: string | Signal<string> | Computed<string>;
  width?: number | string | Signal<number | string> | Computed<number | string>;
  height?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  loading?:
    | 'lazy'
    | 'eager'
    | Signal<'lazy' | 'eager'>
    | Computed<'lazy' | 'eager'>;
  decoding?:
    | 'sync'
    | 'async'
    | 'auto'
    | Signal<'sync' | 'async' | 'auto'>
    | Computed<'sync' | 'async' | 'auto'>;
  crossorigin?:
    | 'anonymous'
    | 'use-credentials'
    | Signal<'anonymous' | 'use-credentials'>
    | Computed<'anonymous' | 'use-credentials'>;
  usemap?: string | Signal<string> | Computed<string>;
  ismap?: boolean | Signal<boolean> | Computed<boolean>;
};
```

### Element Props Types

Each element has its own strongly typed props:

```typescript
export type DivProps = CommonAttributes & EventHandlers;
export type HeadingProps = CommonAttributes & EventHandlers;
export type ParagraphProps = CommonAttributes & EventHandlers;
export type SpanProps = CommonAttributes & EventHandlers;
export type AnchorProps = CommonAttributes & AnchorAttributes & EventHandlers;
export type ButtonProps = CommonAttributes & FormAttributes & EventHandlers;
export type InputProps = CommonAttributes & InputAttributes & EventHandlers;
export type TextareaProps = CommonAttributes &
  TextareaAttributes &
  EventHandlers;
export type SelectProps = CommonAttributes & SelectAttributes & EventHandlers;
export type OptionProps = CommonAttributes & OptionAttributes & EventHandlers;
export type FormProps = CommonAttributes &
  FormElementAttributes &
  EventHandlers;
export type LabelProps = CommonAttributes & LabelAttributes & EventHandlers;
export type ListProps = CommonAttributes & EventHandlers;
export type ListItemProps = CommonAttributes & EventHandlers;
export type TableProps = CommonAttributes & TableAttributes & EventHandlers;
export type TableRowProps = CommonAttributes & EventHandlers;
export type TableCellProps = CommonAttributes & EventHandlers;
export type ImageProps = CommonAttributes & ImageAttributes & EventHandlers;
export type VideoProps = CommonAttributes & VideoAttributes & EventHandlers;
export type AudioProps = CommonAttributes & AudioAttributes & EventHandlers;
export type CanvasProps = CommonAttributes & CanvasAttributes & EventHandlers;
export type NavigationProps = CommonAttributes & EventHandlers;
export type HeaderProps = CommonAttributes & EventHandlers;
export type FooterProps = CommonAttributes & EventHandlers;
export type MainProps = CommonAttributes & EventHandlers;
export type SectionProps = CommonAttributes & EventHandlers;
export type ArticleProps = CommonAttributes & EventHandlers;
export type AsideProps = CommonAttributes & EventHandlers;
export type DetailsProps = CommonAttributes & DetailsAttributes & EventHandlers;
export type SummaryProps = CommonAttributes & EventHandlers;
export type DialogProps = CommonAttributes & DialogAttributes & EventHandlers;
export type MenuProps = CommonAttributes & MenuAttributes & EventHandlers;
export type MenuItemProps = CommonAttributes & EventHandlers;
export type PreProps = CommonAttributes & EventHandlers;
```

### Union Type

All element props are combined into a union type:

```typescript
export type ElementProps =
  | DivProps
  | HeadingProps
  | ParagraphProps
  | SpanProps
  | AnchorProps
  | ButtonProps
  | InputProps
  | TextareaProps
  | SelectProps
  | OptionProps
  | FormProps
  | LabelProps
  | ListProps
  | ListItemProps
  | TableProps
  | TableRowProps
  | TableCellProps
  | ImageProps
  | VideoProps
  | AudioProps
  | CanvasProps
  | NavigationProps
  | HeaderProps
  | FooterProps
  | MainProps
  | SectionProps
  | ArticleProps
  | AsideProps
  | DetailsProps
  | SummaryProps
  | DialogProps
  | MenuProps
  | MenuItemProps
  | PreProps;
```

## Benefits

### 1. Type Safety

- TypeScript will catch invalid props at compile time
- Prevents runtime errors from incorrect attribute usage
- Ensures proper event handler signatures

### 2. IntelliSense Support

- Better autocomplete in IDEs
- Proper documentation for each attribute
- Clear indication of required vs optional props

### 3. Maintainability

- Clear contracts for each element type
- Easier refactoring and debugging
- Better code organization

### 4. Developer Experience

- Reduced runtime errors
- Faster development with better tooling
- Self-documenting code

## Usage Examples

### Basic Usage

```typescript
import { input, button, a, img } from 'reactive-dom';

// Strongly typed input
const inputElement = input({
  type: 'email',
  placeholder: 'Enter email',
  required: true,
  value: emailSignal,
  onInput: handleEmailChange,
});

// Strongly typed button
const buttonElement = button(
  {
    type: 'submit',
    disabled: isDisabledSignal,
    onClick: handleClick,
  },
  'Submit',
);

// Strongly typed anchor
const linkElement = a(
  {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  'External Link',
);

// Strongly typed image
const imageElement = img({
  src: 'image.jpg',
  alt: 'Description',
  width: 300,
  height: 200,
  loading: 'lazy',
});
```

### Reactive Props

```typescript
import { signal, computed } from 'reactive-dom';

const isDisabled = signal(false);
const buttonText = signal('Submit');
const buttonClass = computed(() =>
  isDisabled.get() ? 'btn-disabled' : 'btn-active',
);

const button = button(
  {
    disabled: isDisabled,
    className: buttonClass,
    onClick: handleClick,
  },
  buttonText,
);
```

### Form Elements

```typescript
const form = form(
  {
    action: '/submit',
    method: 'post',
    enctype: 'multipart/form-data',
    onSubmit: handleSubmit,
  },
  input({
    type: 'text',
    name: 'username',
    required: true,
    placeholder: 'Enter username',
  }),
  textarea({
    name: 'message',
    rows: 4,
    cols: 50,
    placeholder: 'Enter message',
  }),
  select(
    {
      name: 'country',
      multiple: false,
    },
    option({ value: 'us' }, 'United States'),
    option({ value: 'ca' }, 'Canada'),
  ),
);
```

## Migration from Previous Version

The strongly typed props are backward compatible. The previous `Record<string, any>` approach still works, but now you get the benefits of strong typing:

```typescript
// Old way (still works)
const div = div({ className: 'container' }, 'Hello');

// New way (with type safety)
const div = div(
  {
    className: 'container',
    id: 'main',
    style: 'color: blue;',
  },
  'Hello',
);
```

## Testing

The implementation includes comprehensive tests to ensure:

1. All element types work correctly
2. Props are properly typed
3. Event handlers work as expected
4. Reactive props update correctly
5. Error handling works properly

## Future Enhancements

Potential improvements for future versions:

1. **More Specific Types**: Add more specific types for complex attributes
2. **Validation**: Runtime validation for props
3. **Custom Elements**: Support for custom element types
4. **Accessibility**: Enhanced accessibility attribute types
5. **Performance**: Optimized type checking for large applications

## Conclusion

The strongly typed props implementation provides a significant improvement in developer experience and code quality while maintaining backward compatibility. It enables better tooling support, reduces runtime errors, and makes the codebase more maintainable.
