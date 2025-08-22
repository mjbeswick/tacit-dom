# Tacit-DOM API Reference

## Core Concepts

### Signals

Signals are reactive values that automatically update when their dependencies change.

```typescript
import { signal } from 'tacit-dom';

const count = signal(0);
console.log(count.get()); // 0
count.set(5);
console.log(count.get()); // 5
```

### Computed Values

Computed values are derived from signals and automatically update when their dependencies change.

```typescript
import { signal, computed } from 'tacit-dom';

const a = signal(1);
const b = signal(2);
const sum = computed(() => a.get() + b.get());
console.log(sum.get()); // 3

a.set(5);
console.log(sum.get()); // 7
```

### Effects

Effects run side effects and automatically re-execute when dependencies change.

```typescript
import { signal, effect } from 'tacit-dom';

const count = signal(0);

// Effect that runs whenever count changes
const cleanup = effect(() => {
  console.log('Count changed to:', count.get());

  // Return cleanup function (optional)
  return () => {
    console.log('Cleaning up effect');
  };
});

// Later, dispose of the effect
cleanup();
```

### Batching

Batch multiple signal updates to prevent unnecessary re-renders.

```typescript
import { signal, batch } from 'tacit-dom';

const a = signal(0);
const b = signal(0);

// Both updates happen together
batch(() => {
  a.set(1);
  b.set(2);
});
```

## API Reference

### `component<P = {}>(componentFn: (props: P) => HTMLElement): Component<P>`

Creates a reactive component that automatically re-renders when its dependencies change.

**Parameters:**

- `componentFn: (props: P) => HTMLElement` - The component function that returns a DOM element

**Returns:**

- `Component<P>` - A reactive component function that can be used with render

**Example:**

```typescript
import { component, div, h1, p, button, useSignal, render } from 'tacit-dom';

// Component without props
const Counter = component(() => {
  const count = useSignal(0);

  return div(
    { className: 'counter' },
    h1('Counter'),
    p(`Count: ${count.get()}`),
    button({ onClick: () => count.set(count.get() + 1) }, 'Increment'),
  );
});

// Component with typed props
const Greeting = component<{ name: string; greeting?: string }>((props) => {
  return div(
    { className: 'greeting' },
    h1(`${props?.greeting || 'Hello'}, ${props?.name || 'World'}!`),
  );
});

// Usage
render(Counter, document.getElementById('app'));
render(
  Greeting({ name: 'Alice', greeting: 'Welcome' }),
  document.getElementById('greeting'),
);
```

### `useSignal<T>(initialValue: T): Signal<T>`

Hook for creating component-scoped signals that persist across re-renders. Can only be called inside a component.

**Parameters:**

- `initialValue: T` - The initial value for the signal

**Returns:**

- `Signal<T>` - A reactive signal that persists across component re-renders

**Example:**

```typescript
import { component, useSignal, div, button } from 'tacit-dom';

const Counter = component(() => {
  const count = useSignal(0);
  const doubled = useSignal(0);

  // The signal persists across re-renders
  return div(
    div(`Count: ${count.get()}`),
    div(`Doubled: ${doubled.get()}`),
    button(
      {
        onClick: () => {
          count.set(count.get() + 1);
          doubled.set(count.get() * 2);
        },
      },
      'Increment',
    ),
  );
});
```

### `Component<P = {}>`

Type for reactive components with optional props.

```typescript
type Component<P = {}> = (props?: P) => HTMLElement;
```

### `render(component: HTMLElement | (() => HTMLElement) | Component<any>, container: HTMLElement): void`

Renders a component into a container element.

**Parameters:**

- `component: HTMLElement | (() => HTMLElement) | Component<any>` - The component to render
- `container: HTMLElement` - The container element to render into

**Example:**

```typescript
import { render, component, div } from 'tacit-dom';

const App = component(() => div('Hello World'));
render(App, document.getElementById('app'));
```

### `cleanup(element: HTMLElement): void`

Cleans up a component and removes it from the DOM.

**Parameters:**

- `element: HTMLElement` - The element to clean up

**Example:**

```typescript
import { cleanup } from 'tacit-dom';

const element = document.getElementById('my-component');
cleanup(element);
```

## DOM Element Factory Functions

Tacit-DOM provides factory functions for creating DOM elements with reactive properties.

### `div(props?: ElementProps, ...children: ElementChildren): HTMLElement`

Creates a div element with optional props and children.

**Parameters:**

- `props?: ElementProps` - Optional element properties (className, event handlers, etc.)
- `...children: ElementChildren` - Child elements, text, or signals

**Returns:**

- `HTMLElement` - A div element

**Example:**

```typescript
import { div, signal } from 'tacit-dom';

const count = signal(0);

const element = div(
  { className: 'counter' },
  'Count: ',
  count, // Signals are automatically reactive
  div({ className: 'nested' }, 'Nested content'),
);
```

### `button(props?: ElementProps, ...children: ElementChildren): HTMLElement`

Creates a button element with optional props and children.

**Parameters:**

- `props?: ElementProps` - Optional element properties
- `...children: ElementChildren` - Child elements, text, or signals

**Returns:**

- `HTMLElement` - A button element

**Example:**

```typescript
import { button, signal } from 'tacit-dom';

const count = signal(0);

const element = button(
  {
    className: 'btn btn-primary',
    onClick: () => count.set(count.get() + 1),
  },
  'Increment',
);
```

### Other Element Factory Functions

- `h1(props?, ...children)` - Creates h1 elements
- `p(props?, ...children)` - Creates paragraph elements
- `span(props?, ...children)` - Creates span elements
- `a(props?, ...children)` - Creates anchor elements

## Conditional and List Rendering

### `when<T>(condition: Signal<T> | Computed<T> | T, renderFn: () => HTMLElement): HTMLElement`

Conditionally renders content based on a signal value. The content automatically re-renders when the signal changes.

**Parameters:**

- `condition: Signal<T> | Computed<T> | T` - A signal, computed value, or static value that determines whether to render
- `renderFn: () => HTMLElement` - A function that returns the content to render when condition is truthy

**Returns:**

- `HTMLElement` - A container element that conditionally renders content

**Example:**

```typescript
import { when, signal, div, h1 } from 'tacit-dom';

const isVisible = signal(true);
const element = when(isVisible, () => div('This is visible'));

// With computed values
const count = signal(0);
const isPositive = computed(() => count.get() > 0);
const element = when(isPositive, () =>
  div(`Count is positive: ${count.get()}`),
);
```

### `map<T>(arraySignal: Signal<T[]> | Computed<T[]> | T[], renderFn: (item: T, index: number) => HTMLElement, selector?: (item: T, index: number) => boolean): HTMLElement`

Maps over an array signal to render a list of elements. The list automatically updates when the array signal changes.

**Parameters:**

- `arraySignal: Signal<T[]> | Computed<T[]> | T[]` - A signal, computed value, or static array
- `renderFn: (item: T, index: number) => HTMLElement` - A function that renders each item in the array
- `selector?: (item: T, index: number) => boolean` - Optional function to filter which items to render

**Returns:**

- `HTMLElement` - A container element that contains the mapped list

**Example:**

```typescript
import { map, signal, div, li } from 'tacit-dom';

// Basic array mapping
const items = signal(['a', 'b', 'c']);
const list = map(items, (item) => div(item));

// With filtering
const numbers = signal([1, 2, 3, 4, 5]);
const evenNumbers = map(
  numbers,
  (num) => div(num),
  (num) => num % 2 === 0,
);
```

### `fragment(...children: (string | number | HTMLElement)[]): DocumentFragment`

Creates a fragment that renders multiple elements without a wrapper container. Useful for returning multiple elements from components.

**Parameters:**

- `...children: (string | number | HTMLElement)[]` - Any number of children (strings, numbers, or HTMLElements)

**Returns:**

- `DocumentFragment` - A fragment containing the children

**Example:**

```typescript
import { fragment, div, h1, p } from 'tacit-dom';

// Basic fragment usage
const elements = fragment(
  div('First element'),
  div('Second element'),
  div('Third element'),
);

// In a component that needs to return multiple elements
const MyComponent = component(() => {
  const showHeader = useSignal(true);
  const showFooter = useSignal(true);

  return fragment(
    when(showHeader, () => h1('Header')),
    div('Main content'),
    when(showFooter, () => div('Footer')),
  );
});
```

## Element Properties

### `ElementProps`

Common properties that can be applied to any element:

```typescript
type ElementProps = {
  /** @deprecated Use classNames instead. className will be removed in a future version. */
  className?: string;
  /**
   * Flexible CSS class names prop that accepts strings, arrays, objects, and more.
   * This is the recommended way to handle CSS classes.
   */
  classNames?:
    | string
    | string[]
    | { [key: string]: any }
    | (string | { [key: string]: any })[];

  // Mouse events
  onClick?: EventHandler;
  onDoubleClick?: EventHandler;
  onMouseDown?: EventHandler;
  onMouseUp?: EventHandler;
  onMouseMove?: EventHandler;
  onMouseEnter?: EventHandler;
  onMouseLeave?: EventHandler;
  onMouseOver?: EventHandler;
  onMouseOut?: EventHandler;
  onWheel?: EventHandler<WheelEvent>;

  // Keyboard events
  onKeyDown?: EventHandler<KeyboardEvent>;
  onKeyUp?: EventHandler<KeyboardEvent>;
  onKeyPress?: EventHandler<KeyboardEvent>;

  // Form events
  onChange?: EventHandler;
  onInput?: EventHandler;
  onSubmit?: EventHandler;
  onFocus?: EventHandler;
  onBlur?: EventHandler;

  // Drag and drop events
  onDrag?: EventHandler;
  onDragStart?: EventHandler;
  onDragEnd?: EventHandler;
  onDragEnter?: EventHandler;
  onDragLeave?: EventHandler;
  onDragOver?: EventHandler;
  onDrop?: EventHandler;

  // Touch events
  onTouchStart?: EventHandler<TouchEvent>;
  onTouchMove?: EventHandler<TouchEvent>;
  onTouchEnd?: EventHandler<TouchEvent>;

  // Other events
  onScroll?: EventHandler;
  onResize?: EventHandler;
  onLoad?: EventHandler;
  onError?: EventHandler;
};
```

### `EventHandler<T = Event>`

Type for event handlers:

```typescript
type EventHandler<T = Event> = (event: T) => void | boolean;
```

## Signal API

### `Signal<T>`

Type for reactive signals:

```typescript
type Signal<T> = {
  get(): T;
  set(value: T): void;
  update(fn: (prev: T) => T | Promise<T>): Promise<void>;
  subscribe(fn: () => void): () => void;
  readonly pending: boolean;
};
```

### `signal<T>(initialValue: T): Signal<T>`

Creates a reactive signal with an initial value.

**Parameters:**

- `initialValue: T` - The initial value for the signal

**Returns:**

- `Signal<T>` - A reactive signal object

**Methods:**

- `get(): T` - Gets the current value and tracks dependencies
- `set(value: T): void` - Sets a new value
- `update(fn: (prev: T) => T | Promise<T>): Promise<void>` - Updates based on previous value
- `subscribe(fn: () => void): () => void` - Subscribes to changes
- `pending: boolean` - Whether any updates are in progress

**Example:**

```typescript
import { signal } from 'tacit-dom';

const count = signal(0);

// Read value
console.log(count.get()); // 0

// Set value
count.set(5);

// Update value
await count.update((prev) => prev + 1);

// Subscribe to changes
const unsubscribe = count.subscribe(() => {
  console.log('Count changed to:', count.get());
});

// Check pending state
console.log(count.pending); // false
```

### `Computed<T>`

Type for computed values:

```typescript
type Computed<T> = {
  get(): T;
  subscribe(fn: () => void): () => void;
};
```

### `computed<T>(computeFn: () => T): Computed<T>`

Creates a computed value that automatically updates when dependencies change.

**Parameters:**

- `computeFn: () => T` - Function that computes the value

**Returns:**

- `Computed<T>` - A computed value object

**Example:**

```typescript
import { signal, computed } from 'tacit-dom';

const a = signal(1);
const b = signal(2);

const sum = computed(() => a.get() + b.get());
console.log(sum.get()); // 3

a.set(5);
console.log(sum.get()); // 7
```

### `effect(fn: () => void | (() => void)): () => void`

Runs a side effect that automatically re-executes when dependencies change.

**Parameters:**

- `fn: () => void | (() => void)` - Function to run, optionally returns cleanup function

**Returns:**

- `() => void` - Function to dispose of the effect

**Example:**

```typescript
import { signal, effect } from 'tacit-dom';

const count = signal(0);

const cleanup = effect(() => {
  console.log('Count changed to:', count.get());

  // Optional cleanup function
  return () => {
    console.log('Effect cleanup');
  };
});

// Later, dispose of the effect
cleanup();
```

### `batch(fn: () => void): void`

Batches multiple signal updates into a single effect flush.

**Parameters:**

- `fn: () => void` - Function containing signal updates

**Example:**

```typescript
import { signal, batch } from 'tacit-dom';

const a = signal(0);
const b = signal(0);

// Both updates happen together
batch(() => {
  a.set(1);
  b.set(2);
});
```

## Component Patterns

### Functional Components

```typescript
import { component, useSignal, div, button } from 'tacit-dom';

const Counter = component(() => {
  const count = useSignal(0);

  return div(
    { className: 'counter' },
    div(`Count: ${count.get()}`),
    button(
      {
        onClick: () => count.set(count.get() + 1),
      },
      'Increment',
    ),
  );
});
```

### Components with Props

```typescript
import { component, div, h1 } from 'tacit-dom';

type UserCardProps = {
  name: string;
  email: string;
  avatar?: string;
};

const UserCard = component<UserCardProps>((props) => {
  return div(
    { className: 'user-card' },
    props.avatar && img({ src: props.avatar, alt: props.name }),
    h1(props.name),
    div({ className: 'email' }, props.email),
  );
});

// Usage
const userCard = UserCard({
  name: 'John Doe',
  email: 'john@example.com',
});
```

### Conditional Rendering

```typescript
import { component, useSignal, div, button } from 'tacit-dom';

const ToggleComponent = component(() => {
  const isVisible = useSignal(true);

  return div(
    button(
      {
        onClick: () => isVisible.set(!isVisible.get()),
      },
      'Toggle',
    ),
    isVisible.get() ? div('Visible content') : null,
  );
});
```

### List Rendering

```typescript
import { component, useSignal, div, ul, li } from 'tacit-dom';

const TodoList = component(() => {
  const todos = useSignal(['Learn Tacit-DOM', 'Build app', 'Deploy']);

  return div(
    h1('Todo List'),
    ul(...todos.get().map((todo, index) => li({ key: index }, todo))),
  );
});
```

## Event Handling

### Click Events

```typescript
import { button, useSignal } from 'tacit-dom';

const Counter = component(() => {
  const count = useSignal(0);

  const handleClick = () => {
    count.set(count.get() + 1);
  };

  return button({ onClick: handleClick }, `Count: ${count.get()}`);
});
```

### Form Events

```typescript
import { input, form, useSignal } from 'tacit-dom';

const ContactForm = component(() => {
  const name = useSignal('');
  const email = useSignal('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('Form submitted:', { name: name.get(), email: email.get() });
  };

  return form(
    { onSubmit: handleSubmit },
    input({
      value: name.get(),
      onInput: (e) => name.set((e.target as HTMLInputElement).value),
      placeholder: 'Name',
    }),
    input({
      value: email.get(),
      onInput: (e) => email.set((e.target as HTMLInputElement).value),
      placeholder: 'Email',
    }),
    button({ type: 'submit' }, 'Submit'),
  );
});
```

### Keyboard Events

```typescript
import { input, useSignal } from 'tacit-dom';

const SearchInput = component(() => {
  const query = useSignal('');

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('Searching for:', query.get());
    }
  };

  return input({
    value: query.get(),
    onInput: (e) => query.set((e.target as HTMLInputElement).value),
    onKeyDown: handleKeyDown,
    placeholder: 'Search...',
  });
});
```

## State Management

### Local Component State

```typescript
import { component, useSignal } from 'tacit-dom';

const LocalStateComponent = component(() => {
  const count = useSignal(0);
  const name = useSignal('World');

  return div(
    div(`Hello, ${name.get()}!`),
    div(`Count: ${count.get()}`),
    button({ onClick: () => count.set(count.get() + 1) }, 'Increment'),
  );
});
```

### Global State

```typescript
import { signal } from 'tacit-dom';

// Global state
const globalCounter = signal(0);
const globalUser = signal({ name: 'Guest', isLoggedIn: false });

// Actions
const incrementGlobal = () => globalCounter.set(globalCounter.get() + 1);
const loginUser = (name: string) => globalUser.set({ name, isLoggedIn: true });

// Export for use in components
export { globalCounter, globalUser, incrementGlobal, loginUser };
```

### Derived State

```typescript
import { component, useSignal, computed } from 'tacit-dom';

const UserProfile = component(() => {
  const firstName = useSignal('John');
  const lastName = useSignal('Doe');

  // Computed value that updates automatically
  const fullName = computed(() => `${firstName.get()} ${lastName.get()}`);
  const initials = computed(() => `${firstName.get()[0]}${lastName.get()[0]}`);

  return div(
    div(`Full Name: ${fullName.get()}`),
    div(`Initials: ${initials.get()}`),
  );
});
```

## Performance Considerations

### Signal Optimization

- Avoid creating signals in render functions
- Use computed values for expensive calculations
- Batch updates when possible
- Clean up subscriptions to prevent memory leaks

### Component Optimization

- Components automatically re-render only when needed
- Signals persist across re-renders
- Effects automatically track dependencies
- No manual subscription management needed

## Migration from Previous Versions

### Key Changes

1. **Component System**: Use `component()` instead of `createReactiveComponent()`
2. **State Management**: Use `useSignal()` hook instead of creating signals in components
3. **Event Handling**: Use camelCase event names (`onClick` instead of `onclick`)
4. **Reactivity**: Components automatically re-render when signals change
5. **No More**: `reactiveText`, `createReactiveComponent`, manual subscriptions

### Before (Old API)

```typescript
// Old way
const Counter = createReactiveComponent(() => {
  const count = signal(0);
  return div(
    span(`Count: ${count.get()}`),
    button({ onclick: () => count.set(count.get() + 1) }, 'Increment'),
  );
});
```

### After (New API)

```typescript
// New way
const Counter = component(() => {
  const count = useSignal(0);
  return div(
    div(`Count: ${count.get()}`),
    button({ onClick: () => count.set(count.get() + 1) }, 'Increment'),
  );
});
```

## Best Practices

1. **Use `useSignal()` for component state** - Signals persist across re-renders
2. **Keep components simple** - Extract complex logic into separate functions
3. **Use computed values** - For derived state that depends on other signals
4. **Handle events properly** - Use camelCase event names and proper event types
5. **Clean up effects** - Return cleanup functions from effects when needed
6. **Batch updates** - Use `batch()` for multiple related signal updates
7. **Type your components** - Use TypeScript generics for better type safety

## Examples

See the `examples/` directory for complete working examples of:

- Basic signals and components
- Complex state management
- Form handling
- List rendering
- Conditional rendering
- Event handling
- Performance optimization
