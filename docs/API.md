# Reactive-DOM API Reference

## Core Concepts

### Signals

Signals are reactive values that automatically update when their dependencies change.

```typescript
import { signal } from 'reactive-dom';

const count = signal(0);
console.log(count.get()); // 0
count.set(5);
console.log(count.get()); // 5
```

### Computed Values

Computed values are derived from signals and automatically update when their dependencies change.

```typescript
import { signal, computed } from 'reactive-dom';

const a = signal(1);
const b = signal(2);
const sum = computed(() => a.get() + b.get());
console.log(sum.get()); // 3

a.set(5);
console.log(sum.get()); // 7
```

## API Reference

### `signal<T>(initialValue: T): Signal<T>`

Creates a reactive signal with an initial value.

**Parameters:**

- `initialValue: T` - The initial value for the signal

**Returns:**

- `Signal<T>` - A reactive signal object

**Example:**

```typescript
const count = signal(0);
const name = signal('John');
const items = signal(['apple', 'banana']);
```

### `Signal<T>`

A reactive signal object with the following methods:

#### `get(): T`

Gets the current value of the signal.

**Returns:**

- `T` - The current value

#### `set(value: T): void`

Sets a new value for the signal and notifies all subscribers.

**Parameters:**

- `value: T` - The new value

#### `subscribe(callback: () => void): () => void`

Subscribes to changes in the signal.

**Parameters:**

- `callback: () => void` - Function to call when the signal changes

**Returns:**

- `() => void` - Unsubscribe function

**Example:**

```typescript
const count = signal(0);
const unsubscribe = count.subscribe(() => {
  console.log('Count changed to:', count.get());
});

count.set(5); // Logs: "Count changed to: 5"
unsubscribe(); // Stop listening for changes
```

### `computed<T>(fn: () => T): Computation`

Creates a computed value that automatically updates when its dependencies change.

**Parameters:**

- `fn: () => T` - Function that computes the value

**Returns:**

- `Computation` - A computed value object

**Example:**

```typescript
const a = signal(1);
const b = signal(2);
const sum = computed(() => a.get() + b.get());
const doubleSum = computed(() => sum.get() * 2);
```

### `Computation`

A computed value object with the following methods:

#### `get(): T`

Gets the current computed value.

**Returns:**

- `T` - The current computed value

#### `subscribe(callback: () => void): () => void`

Subscribes to changes in the computed value.

**Parameters:**

- `callback: () => void` - Function to call when the computed value changes

**Returns:**

- `() => void` - Unsubscribe function

## DOM Elements

All HTML elements are available as factory functions that return DOM elements.

### Basic Elements

```typescript
import { div, h1, h2, h3, h4, h5, h6, p, span, a } from 'reactive-dom';

const element = div(
  { className: 'container' },
  h1({ children: 'Title' }),
  p({ children: 'Content' }),
  span({ children: 'Inline text' }),
  a({ href: '#', children: 'Link' })
);
```

## Dynamic Class Names

The library includes a utility for handling dynamic className props with arrays and objects:

```typescript
import { classNames } from 'reactive-dom';

// String
classNames('foo'); // 'foo'

// Multiple strings
classNames('foo', 'bar'); // 'foo bar'

// Array
classNames(['foo', 'bar']); // 'foo bar'

// Object (conditional classes)
classNames({ foo: true, bar: false, baz: true }); // 'foo baz'

// Mixed
classNames('foo', { bar: true, baz: false }, ['qux']); // 'foo bar qux'

// With reactive values
const isActive = signal(true);
const size = signal('large');

const classes = computed(() =>
  classNames('button', 'btn', {
    'btn-active': isActive.get(),
    'btn-large': size.get() === 'large',
    'btn-small': size.get() === 'small',
  })
);
```

### Form Elements

```typescript
import {
  form,
  input,
  textarea,
  select,
  option,
  label,
  button,
} from 'reactive-dom';

const formElement = form(
  { onSubmit: e => e.preventDefault() },
  label({ children: 'Name:' }),
  input({ type: 'text', placeholder: 'Enter name' }),
  textarea({ placeholder: 'Enter description' }),
  select(
    {},
    option({ value: '1', children: 'Option 1' }),
    option({ value: '2', children: 'Option 2' })
  ),
  button({ type: 'submit', children: 'Submit' })
);
```

### List Elements

```typescript
import { ul, ol, li } from 'reactive-dom';

const list = ul(
  {},
  li({ children: 'Item 1' }),
  li({ children: 'Item 2' }),
  li({ children: 'Item 3' })
);
```

### Table Elements

```typescript
import { table, tr, td, th } from 'reactive-dom';

const tableElement = table(
  {},
  tr({}, th({ children: 'Header 1' }), th({ children: 'Header 2' })),
  tr({}, td({ children: 'Cell 1' }), td({ children: 'Cell 2' }))
);
```

### Media Elements

```typescript
import { img, video, audio, canvas } from 'reactive-dom';

const mediaElements = div(
  {},
  img({ src: 'image.jpg', alt: 'Image' }),
  video({ src: 'video.mp4', controls: true }),
  audio({ src: 'audio.mp3', controls: true }),
  canvas({ width: 300, height: 200 })
);
```

### Semantic Elements

```typescript
import {
  nav,
  header,
  footer,
  main,
  section,
  article,
  aside,
} from 'reactive-dom';

const semanticLayout = div(
  {},
  header({ children: 'Header' }),
  nav({ children: 'Navigation' }),
  main(
    {},
    section({ children: 'Section 1' }),
    article({ children: 'Article' }),
    aside({ children: 'Sidebar' })
  ),
  footer({ children: 'Footer' })
);
```

## Event Handling

All DOM elements support event handlers through props:

```typescript
const button = button(
  {
    onClick: e => console.log('Clicked!'),
    onMouseEnter: () => console.log('Mouse entered'),
    onMouseLeave: () => console.log('Mouse left'),
    onKeyDown: e => console.log('Key pressed:', e.key),
  },
  'Click me'
);
```

## Styling

Elements can be styled using className and style props:

```typescript
const styledElement = div(
  {
    className: 'my-class',
    style: 'background-color: red; color: white; padding: 10px;',
  },
  'Styled content'
);
```

## Reactive Values in DOM

Signals and computed values can be used directly in DOM elements:

```typescript
const count = signal(0);
const doubleCount = computed(() => count.get() * 2);

const reactiveElement = div(
  {},
  p({ children: `Count: ${count}` }),
  p({ children: `Double: ${doubleCount}` }),
  button({ onClick: () => count.set(count.get() + 1) }, 'Increment')
);
```

## Rendering

### `render(component: HTMLElement, container: HTMLElement): void`

Renders a component to a DOM container.

**Parameters:**

- `component: HTMLElement` - The component to render
- `container: HTMLElement` - The container element

**Example:**

```typescript
const app = document.getElementById('app');
if (app) {
  render(MyComponent({}, []), app);
}
```

## TypeScript Types

```typescript
import { type Signal, type Computation } from 'reactive-dom';

// Signal types
const count: Signal<number> = signal(0);
const name: Signal<string> = signal('John');
const items: Signal<string[]> = signal(['apple', 'banana']);

// Computation types
const sum: Computation = computed(() => a.get() + b.get());
const formatted: Computation = computed(() => `Count: ${count.get()}`);
```

## Best Practices

### 1. Component Structure

```typescript
const MyComponent = (props: any, children: any) => {
  // Local state
  const localCount = signal(0);

  // Computed values
  const displayValue = computed(() => localCount.get() * 2);

  // Event handlers
  const handleClick = () => {
    localCount.set(localCount.get() + 1);
  };

  // Return DOM element
  return div(
    { className: 'my-component' },
    h1({ children: 'My Component' }),
    p({ children: `Value: ${displayValue}` }),
    button({ onClick: handleClick }, 'Increment')
  );
};
```

### 2. Global State Management

```typescript
// Global signals
const globalCount = signal(0);
const globalUser = signal({ name: 'John', age: 30 });

// Global computed values
const isAdult = computed(() => globalUser.get().age >= 18);
const displayName = computed(() => globalUser.get().name);
```

### 3. Event Handling

```typescript
const handleFormSubmit = (e: Event) => {
  e.preventDefault();
  // Handle form submission
};

const handleInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  value.set(target.value);
};

const form = form(
  { onSubmit: handleFormSubmit },
  input({ onInput: handleInputChange })
);
```

### 4. Conditional Rendering

```typescript
const showDetails = signal(false);

const component = div(
  {},
  button(
    { onClick: () => showDetails.set(!showDetails.get()) },
    'Toggle Details'
  ),
  showDetails.get() &&
    div({ className: 'details' }, p({ children: 'Hidden details here' }))
);
```

### 5. List Rendering

```typescript
const items = signal(['apple', 'banana', 'orange']);

const list = ul(
  {},
  ...items.get().map(item => li({ key: item, children: item }))
);
```
