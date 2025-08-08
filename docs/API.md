# Thorix API Reference

## Core Concepts

### Signals

Signals are reactive values that automatically update when their dependencies change.

```typescript
import { signal } from 'thorix';

const count = signal(0);
console.log(count.get()); // 0
count.set(5);
console.log(count.get()); // 5
```

### Computed Values

Computed values are derived from signals and automatically update when their dependencies change.

```typescript
import { signal, computed } from 'thorix';

const a = signal(1);
const b = signal(2);
const sum = computed(() => a.get() + b.get());
console.log(sum.get()); // 3

a.set(5);
console.log(sum.get()); // 7
```

## API Reference

### `signal<T>(initialValue: T, key?: string): Signal<T>`

Creates a reactive signal with an initial value. When used inside components, signals can optionally preserve their state between renders by providing a unique key.

**Parameters:**

- `initialValue: T` - The initial value for the signal
- `key?: string` - Optional unique key for preserving state between component renders

**Returns:**

- `Signal<T>` - A reactive signal object

**Example:**

```typescript
// Global signal (no preservation needed)
const globalCount = signal(0);

// Component-local signal with preservation
const app = () => {
  const localCount = signal(0, 'count'); // Preserved between renders
  const tempValue = signal('temp'); // Recreated each render

  return div(
    button({ onclick: () => localCount.set(localCount.get() + 1) }, localCount),
  );
};
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

#### `update(fn: (prev: T) => T): void`

Updates the signal value based on the previous value.

**Parameters:**

- `fn: (prev: T) => T` - Function that receives the previous value and returns the new value

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
count.update((prev) => prev + 1); // Logs: "Count changed to: 6"
unsubscribe(); // Stop listening for changes
```

### `computed<T>(fn: () => T): Computed<T>`

Creates a computed value that automatically updates when its dependencies change.

**Parameters:**

- `fn: () => T` - Function that computes the value

**Returns:**

- `Computed<T>` - A computed value object

**Example:**

```typescript
const a = signal(1);
const b = signal(2);
const sum = computed(() => a.get() + b.get());
const doubleSum = computed(() => sum.get() * 2);
```

### `Computed<T>`

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

### `effect(fn: () => void, options?: EffectOptions): () => void`

Runs a reactive effect that re-executes when its dependencies change.

**Parameters:**

- `fn: () => void` - Function to execute
- `options?: EffectOptions` - Optional configuration

**Returns:**

- `() => void` - Cleanup function

**Example:**

```typescript
const count = signal(0);

effect(() => {
  console.log('Count is now:', count.get());
});

count.set(5); // Logs: "Count is now: 5"
```

### `batch(fn: () => void): void`

Batches multiple signal updates into a single effect flush.

**Parameters:**

- `fn: () => void` - Function containing signal updates

**Example:**

```typescript
const firstName = signal('John');
const lastName = signal('Doe');

// Updates are batched together
batch(() => {
  firstName.set('Jane');
  lastName.set('Smith');
});
```

### `classNames(...inputs: ClassValue[]): string`

Conditionally joins CSS class names together.

**Parameters:**

- `...inputs: ClassValue[]` - Any number of class name values to join

**Returns:**

- `string` - A space-separated string of class names

**Example:**

```typescript
import { classNames } from 'thorix';

classNames('foo', 'bar'); // 'foo bar'
classNames({ active: true, disabled: false }); // 'active'
classNames('button', { primary: true }, ['icon', 'large']); // 'button primary icon large'
```

## DOM Elements

All HTML elements are available as factory functions that return DOM elements.

### Basic Elements

```typescript
import { div, h1, h2, h3, h4, h5, h6, p, span, a } from 'thorix';

const element = div(
  { className: 'container' },
  h1('Title'),
  p('Content'),
  span('Inline text'),
  a({ href: '#' }, 'Link'),
);
```

## Dynamic Class Names

The library includes a utility for handling dynamic className props with arrays and objects:

```typescript
import { classNames } from 'thorix';

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
  }),
);
```

### Form Elements

```typescript
import { form, input, textarea, select, option, label, button } from 'thorix';

const formElement = form(
  { onsubmit: (e) => e.preventDefault() },
  label('Name:'),
  input({ type: 'text', placeholder: 'Enter name' }),
  textarea({ placeholder: 'Enter description' }),
  select(
    option({ value: '1' }, 'Option 1'),
    option({ value: '2' }, 'Option 2'),
  ),
  button({ type: 'submit' }, 'Submit'),
);
```

### List Elements

```typescript
import { ul, ol, li } from 'thorix';

const list = ul(li('Item 1'), li('Item 2'), li('Item 3'));
```

### Table Elements

```typescript
import { table, tr, td, th } from 'thorix';

const tableElement = table(
  tr(th('Header 1'), th('Header 2')),
  tr(td('Cell 1'), td('Cell 2')),
);
```

### Media Elements

```typescript
import { img, video, audio, canvas } from 'thorix';

const mediaElements = div(
  img({ src: 'image.jpg', alt: 'Image' }),
  video({ src: 'video.mp4', controls: true }),
  audio({ src: 'audio.mp3', controls: true }),
  canvas({ width: 300, height: 200 }),
);
```

### Semantic Elements

```typescript
import { nav, header, footer, main, section, article, aside } from 'thorix';

const semanticLayout = div(
  header('Header'),
  nav('Navigation'),
  main(section('Section 1'), article('Article'), aside('Sidebar')),
  footer('Footer'),
);
```

## Event Handling

All DOM elements support event handlers through props:

```typescript
const button = button(
  {
    onclick: (e) => console.log('Clicked!'),
    onmouseenter: () => console.log('Mouse entered'),
    onmouseleave: () => console.log('Mouse left'),
    onkeydown: (e) => console.log('Key pressed:', e.key),
  },
  'Click me',
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
  'Styled content',
);
```

## Reactive Values in DOM

Signals and computed values can be used directly in DOM elements:

```typescript
const count = signal(0);
const doubleCount = computed(() => count.get() * 2);

const reactiveElement = div(
  p(`Count: ${count}`),
  p(`Double: ${doubleCount}`),
  button({ onclick: () => count.set(count.get() + 1) }, 'Increment'),
);
```

## Rendering

### `render(component: () => HTMLElement, container: HTMLElement): void`

Renders a component to a DOM container.

**Parameters:**

- `component: () => HTMLElement` - The component function to render
- `container: HTMLElement` - The container element

**Example:**

```typescript
const app = () => {
  const count = signal(0);
  return div(
    p(`Count: ${count}`),
    button({ onclick: () => count.set(count.get() + 1) }, 'Increment'),
  );
};

const container = document.getElementById('app');
if (container) {
  render(app, container);
}
```

## TypeScript Types

```typescript
import { type Signal, type Computed } from 'thorix';

// Signal types
const count: Signal<number> = signal(0);
const name: Signal<string> = signal('John');
const items: Signal<string[]> = signal(['apple', 'banana']);

// Computed types
const sum: Computed<number> = computed(() => a.get() + b.get());
const formatted: Computed<string> = computed(() => `Count: ${count.get()}`);
```

## Best Practices

### 1. Component Structure

```typescript
const MyComponent = () => {
  // Local state with preservation
  const localCount = signal(0, 'count');

  // Computed values
  const displayValue = computed(() => localCount.get() * 2);

  // Event handlers
  const handleClick = () => {
    localCount.set(localCount.get() + 1);
  };

  // Return DOM element
  return div(
    { className: 'my-component' },
    h1('My Component'),
    p(`Value: ${displayValue}`),
    button({ onclick: handleClick }, 'Increment'),
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
  { onsubmit: handleFormSubmit },
  input({ oninput: handleInputChange }),
);
```

### 4. Conditional Rendering

```typescript
const showDetails = signal(false);

const component = div(
  button(
    { onclick: () => showDetails.set(!showDetails.get()) },
    'Toggle Details',
  ),
  showDetails.get() && div({ className: 'details' }, p('Hidden details here')),
);
```

### 5. List Rendering

```typescript
const items = signal(['apple', 'banana', 'orange']);

const list = ul(...items.get().map((item) => li({ key: item }, item)));
```

### 6. CSS Modules Integration

```typescript
import styles from './Component.module.css';

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
