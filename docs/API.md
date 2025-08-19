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

### `component<P = void>(componentFn: (props?: P) => HTMLElement): Component<P>`

Creates a reactive component that automatically re-renders when its dependencies change. This is an alias for `createReactiveComponent`.

**Parameters:**

- `componentFn: (props?: P) => HTMLElement` - The component function that returns a DOM element

**Returns:**

- `Component<P>` - A reactive component function that can be used with render

**Example:**

```typescript
import { component, div, h1, p, button, signal, render } from 'thorix';

// Component without props
const Counter = component(() => {
  const count = signal(0);

  return div(
    { className: 'counter' },
    h1('Counter'),
    p(`Count: ${count.get()}`),
    button({ onclick: () => count.set(count.get() + 1) }, 'Increment'),
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

### `createReactiveComponent<P = void>(componentFn: (props?: P) => HTMLElement): Component<P>`

The underlying function that creates reactive components. `component` is the preferred alias.

**Parameters:**

- `componentFn: (props?: P) => HTMLElement` - The component function that returns a DOM element

**Returns:**

- `Component<P>` - A reactive component function with additional internal methods

**Internal Methods:**

- `_setContainer(container: HTMLElement): void` - Sets the container for automatic re-rendering

### `Component<P = void>`

Type for reactive components with optional props.

**Type Definition:**

```typescript
type Component<P = void> = ((props?: P) => HTMLElement) & {
  _setContainer: (container: HTMLElement) => void;
};
```

**Usage:**

```typescript
import type { Component } from 'thorix';

// Component without props
const SimpleComponent: Component = component(() => {
  return div('Hello World');
});

// Component with typed props
const UserComponent: Component<{ name: string; age: number }> = component(
  (props) => {
    return div(`Name: ${props?.name}, Age: ${props?.age}`);
  },
);
```

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

#### `update(fn: (prev: T) => T | Promise<T>): Promise<void>`

Updates the signal value based on the previous value. Supports both synchronous and asynchronous update functions.

**Parameters:**

- `fn: (prev: T) => T | Promise<T>` - Function that receives the previous value and returns the new value or a Promise resolving to the new value

**Returns:**

- `Promise<void>` - Promise that resolves when the update is complete

**Example:**

```typescript
// Synchronous update
await count.update((prev) => prev + 1);

// Asynchronous update
await count.update(async (prev) => {
  const result = await fetch('/api/increment', {
    method: 'POST',
    body: JSON.stringify({ value: prev }),
  });
  const data = await result.json();
  return data.newValue;
});
```

#### `pending: boolean`

A read-only reactive property that indicates whether the signal has any pending updates. This property automatically triggers effects and component re-renders when the pending state changes, making it perfect for UI state management to show loading indicators or disable inputs during updates.

**Example:**

```typescript
const count = signal(0);

// Check if updates are in progress
if (count.pending) {
  console.log('Signal is being updated...');
}

// Use in UI components
button(
  {
    disabled: count.pending,
    onclick: () =>
      count.update(async (prev) => {
        await someAsyncOperation();
        return prev + 1;
      }),
  },
  count.pending ? 'Updating...' : 'Increment',
);
```

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
await count.update((prev) => prev + 1); // Logs: "Count changed to: 6"
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

### `EffectOptions`

Configuration options for effects:

```typescript
type EffectOptions = {
  name?: string; // Name for debugging
  maxRuns?: number; // Maximum number of times the effect can run
  autoDisable?: boolean; // Automatically disable after maxRuns
};
```

### `mount(fn: () => void | (() => void), dependencies: (Signal<any> | Computed<any>)[]): void`

Mounts a component effect that runs once when dependencies are first accessed, and automatically cleans up when the component unmounts.

**Parameters:**

- `fn: () => void | (() => void)` - Function to run on mount, can return a cleanup function
- `dependencies: (Signal<any> | Computed<any>)[]` - Array of signals or computed values to track

**Example:**

```typescript
function TimerComponent() {
  const count = signal(0);

  mount(() => {
    const interval = setInterval(() => {
      count.set(count.get() + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [count]);

  return div(`Count: ${count.get()}`);
}
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

### `setDebugMode(enabled: boolean): void`

Enables or disables debug mode for console logging.

**Parameters:**

- `enabled: boolean` - Whether to enable debug mode

### `setComponentInstance(componentInstance: object): void`

Sets the current component instance for signal preservation. This is used internally by the rendering system.

**Parameters:**

- `componentInstance: object` - The component instance

### `clearComponentInstance(): void`

Clears the current component instance. This is used internally by the rendering system.

### `cleanupPreservedSignals(componentInstance: object): void`

Cleans up preserved signals for a component instance. This should be called when a component is unmounted.

**Parameters:**

- `componentInstance: object` - The component instance to clean up

### `classes(...inputs: ClassValue[]): string`

Conditionally joins CSS class names together. This is the preferred function name for the classNames utility.

**Parameters:**

- `...inputs: ClassValue[]` - Any number of class name values to join

**Returns:**

- `string` - A space-separated string of class names

**Example:**

```typescript
import { classes } from 'thorix';

classes('foo', 'bar'); // 'foo bar'
classes({ active: true, disabled: false }); // 'active'
classes('button', { primary: true }, ['icon', 'large']); // 'button primary icon large'
```

### `classNames(...inputs: ClassValue[]): string`

Alias for `classes()` function. Conditionally joins CSS class names together.

**Parameters:**

- `...inputs: ClassValue[]` - Any number of class name values to join

**Returns:**

- `string` - A space-separated string of class names

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

### Additional Elements

```typescript
import {
  details,
  summary,
  dialog,
  menu,
  menuitem,
  pre,
  template,
} from 'thorix';

const additionalElements = div(
  details(summary('Click to expand'), p('Hidden content')),
  dialog('Modal dialog'),
  menu(menuitem('Menu item 1'), menuitem('Menu item 2')),
  pre('Preformatted text'),
);
```

## DOM Utilities

### `template(strings: TemplateStringsArray, ...values: (Signal<any> | Computed<any> | any)[]): HTMLElement`

Creates a reactive template string that can interpolate signals. This is a more powerful alternative to template strings that allows explicit signal binding.

**Parameters:**

- `strings: TemplateStringsArray` - Template string literals
- `...values: (Signal<any> | Computed<any> | any)[]` - Values to interpolate, can include signals

**Returns:**

- `HTMLElement` - A reactive DOM element

**Example:**

```typescript
const count = signal(0);
const name = signal('World');

const element = template`Hello ${name}, count is ${count}`;

// The element automatically updates when signals change
count.set(5); // Updates the displayed count
name.set('Universe'); // Updates the displayed name
```

### `createElement(tagName: string): ElementCreator`

Creates a factory function for a custom HTML element.

**Parameters:**

- `tagName: string` - The HTML tag name

**Returns:**

- `ElementCreator` - A function that creates elements of the specified type

**Example:**

```typescript
const customDiv = createElement('custom-div');
const element = customDiv({ className: 'custom' }, 'Custom content');
```

### `createReactiveList<T>(items: Signal<T[]> | T[], renderFn: (item: T, index: number) => HTMLElement): HTMLElement`

Creates a reactive list that automatically updates when the items array changes.

**Parameters:**

- `items: Signal<T[]> | T[]` - Array of items or signal containing array
- `renderFn: (item: T, index: number) => HTMLElement` - Function to render each item

**Returns:**

- `HTMLElement` - A container element containing the rendered list

**Example:**

```typescript
const items = signal(['apple', 'banana', 'orange']);

const list = createReactiveList(items, (item, index) =>
  li({ key: index }, item),
);

// When items change, the list automatically updates
items.set(['grape', 'mango', 'kiwi']);
```

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

### `cleanup(component: HTMLElement): void`

Cleans up a component and its associated reactive subscriptions.

**Parameters:**

- `component: HTMLElement` - The component element to clean up

**Example:**

```typescript
const container = document.getElementById('app');
if (container) {
  render(app, container);

  // Later, when unmounting
  cleanup(container);
}
```

## Router

### `createRouter(config: RouterConfig): Router`

Creates a router instance with the specified configuration.

**Parameters:**

- `config: RouterConfig` - Router configuration object

**Returns:**

- `Router` - A router instance

**Example:**

```typescript
const router = createRouter({
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
    { path: '/users/:id', component: UserPage },
  ],
  basePath: '/app',
  defaultRoute: '/',
  notFoundComponent: NotFoundPage,
});
```

### `router(props: RouterConfig): HTMLElement`

Router component that can be used directly in the component tree.

**Parameters:**

- `props: RouterConfig` - Router configuration

**Returns:**

- `HTMLElement` - A router container element

**Example:**

```typescript
const App = () => {
  return router({
    routes: [
      { path: '/', component: HomePage },
      { path: '/about', component: AboutPage },
    ],
  });
};
```

### `link(props: { to: string; className?: string; children: any; [key: string]: any }): HTMLElement`

Creates a navigation link that integrates with the router.

**Parameters:**

- `props.to: string` - The route to navigate to
- `props.className?: string` - Optional CSS class name
- `props.children: any` - Link content
- `props[key: string]: any` - Additional HTML attributes

**Returns:**

- `HTMLElement` - An anchor element with router integration

**Example:**

```typescript
const navigation = nav(
  link({ to: '/', className: 'nav-link' }, 'Home'),
  link({ to: '/about', className: 'nav-link' }, 'About'),
  link({ to: '/contact', className: 'nav-link' }, 'Contact'),
);
```

### Router Types

```typescript
type Route = {
  path: string;
  component: (data?: any) => HTMLElement;
  loader?: (params: RouteParams, search: RouteSearch) => Promise<any> | any;
  errorBoundary?: (error: Error) => HTMLElement;
};

type RouterConfig = {
  routes: Route[];
  basePath?: string;
  defaultRoute?: string;
  notFoundComponent?: () => HTMLElement;
};

type RouteParams = Record<string, string>;
type RouteSearch = Record<string, string>;

type RouterState = {
  currentPath: string;
  params: RouteParams;
  search: RouteSearch;
  data: any;
  error: Error | null;
  isLoading: boolean;
};
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

## TypeScript Types

```typescript
import { type Signal, type Computed, type ClassValue } from 'thorix';

// Signal types
const count: Signal<number> = signal(0);
const name: Signal<string> = signal('John');
const items: Signal<string[]> = signal(['apple', 'banana']);

// Computed types
const sum: Computed<number> = computed(() => a.get() + b.get());
const formatted: Computed<string> = computed(() => `Count: ${count.get()}`);

// Class value types
const classes: ClassValue[] = ['button', { primary: true }, ['icon', 'large']];
```

### Element Props Types

All DOM elements have strongly-typed props:

```typescript
import type {
  DivProps,
  ButtonProps,
  InputProps,
  FormProps,
  // ... and many more
} from 'thorix';

// These types include common attributes, event handlers, and element-specific attributes
const button: ButtonProps = {
  className: 'btn',
  onclick: (e) => console.log('clicked'),
  disabled: false,
  type: 'submit',
};
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

const list = createReactiveList(items, (item, index) =>
  li({ key: index }, item),
);
```

### 6. CSS Modules Integration

```typescript
import styles from './Component.module.css';

const Button = ({ variant, disabled, children }) => {
  return button(
    {
      className: classes(styles.button, styles[`button--${variant}`], {
        [styles['button--disabled']]: disabled,
      }),
    },
    children,
  );
};
```

### 7. Template String Interpolation

```typescript
const user = signal({ name: 'John', age: 30 });
const greeting = template`Hello ${user.get().name}, you are ${user.get().age} years old`;

// Updates automatically when user changes
user.set({ name: 'Jane', age: 25 });
```

### 8. Component Lifecycle with mount

```typescript
const TimerComponent = () => {
  const count = signal(0);

  mount(() => {
    const interval = setInterval(() => {
      count.set(count.get() + 1);
    }, 1000);

    // Return cleanup function
    return () => clearInterval(interval);
  }, [count]);

  return div(`Timer: ${count.get()}`);
};
```

### 9. Router with Loaders and Error Boundaries

```typescript
const UserPage = () => {
  return div('User Profile');
};

const userLoader = async (params: RouteParams) => {
  const response = await fetch(`/api/users/${params.id}`);
  if (!response.ok) throw new Error('User not found');
  return response.json();
};

const userErrorBoundary = (error: Error) => {
  return div(
    { className: 'error' },
    h1('Error'),
    p(error.message),
    button({ onclick: () => window.history.back() }, 'Go Back'),
  );
};

const routes = [
  {
    path: '/users/:id',
    component: UserPage,
    loader: userLoader,
    errorBoundary: userErrorBoundary,
  },
];
```
