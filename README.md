<div align="center">

![Tacit-DOM Banner](docs/images/tacit-dom_banner.svg)

> A React-like library with reactive signals and computed values for building dynamic web applications—without the need for JSX.

</div>

<div align="center">

⚠️ **Proof of Concept Warning** ⚠️

This project is currently a **proof of concept** and is **not suitable for production use**. It's designed to explore reactive programming patterns and demonstrate an alternative approach to React.

_Think of it as a "what if React was simpler?" experiment. Use at your own risk! 🧪_

</div>

[![NPM Version](https://img.shields.io/npm/v/tacit-dom.svg)](https://www.npmjs.com/package/tacit-dom)
[![License](https://img.shields.io/npm/l/tacit-dom.svg)](https://github.com/mjbeswick/tacit-dom/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/mjbeswick/tacit-dom/test-examples.yml?branch=main)](https://github.com/mjbeswick/tacit-dom/actions)

## 📋 Table of Contents

- [Project Status](#-project-status)
- [Features](#-features)
- [Why Tacit-DOM?](#-why-tacit-dom)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Components](#-components)
- [Conditional and List Rendering](#-conditional-and-list-rendering)
- [Examples](#-examples)
- [Documentation](#-documentation)
- [API Reference](#-api-reference)
- [Development](#-development)
- [License](#-license)

## ⚠️ Project Status

**Current Status**: Experimental Proof of Concept

- **🚧 Experimental**: APIs are evolving and may change without notice
- **🧪 Proof of Concept**: Designed to explore reactive programming patterns
- **⚠️ Not Production Ready**: Limited test coverage and may break with non-trivial use cases
- **🔄 Work in Progress**: Subject to significant changes and improvements

> **Note**: If you need a stable, production-ready solution, consider established alternatives like React, Vue, or Svelte.

## ✨ Features

### 🚀 Core Reactivity

- **⚡ Reactive Signals**: Create reactive state that automatically updates when dependencies change
- **🧮 Computed Values**: Derive values from signals with automatic dependency tracking
- **🌍 Global State Management**: Create global state anywhere without providers, context, or complex setup
- **🧹 Automatic Cleanup**: Prevents memory leaks with smart cleanup

### 🎨 DOM & Components

- **🚫 No Virtual DOM**: Direct DOM updates without the overhead of virtual DOM reconciliation
- **🧩 Component Pattern**: Build components using a familiar JSX-like syntax
- **🎭 Conditional Rendering**: Built-in `when` function for reactive conditional content
- **📋 List Rendering**: Powerful `map` function with optional filtering for dynamic lists
- **🧩 Fragment Support**: `fragment` function for returning multiple elements without wrappers
- **🎯 Event Handling**: Built-in support for DOM events

### 🛠️ Developer Experience

- **🔒 TypeScript Support**: Full TypeScript support with type safety
- **📦 Zero Dependencies**: Lightweight with no external dependencies
- **⚡ Optimized Bundles**: Multiple formats (ESM, UMD, CJS) with Rollup
- **🎯 Tree-shaking**: Individual modules for optimal bundling
- **🌍 i18n Support**: Built-in internationalization with reactive translations

## 🚀 Why Tacit-DOM?

React has transformed web development, but **state management complexity remains a significant pain point**. Tacit-DOM offers a simpler, signal-first approach that addresses these fundamental issues:

### 🎯 Key Advantages

| Feature              | React                            | Tacit-DOM                   |
| -------------------- | -------------------------------- | --------------------------- |
| **State Management** | Hooks, Context, Redux, etc.      | Simple signals, anywhere    |
| **Re-renders**       | Component-level re-renders       | Granular DOM updates only   |
| **Dependencies**     | Manual dependency arrays         | Automatic tracking          |
| **Virtual DOM**      | Yes (overhead)                   | No (direct updates)         |
| **Bundle Size**      | Larger (React + dependencies)    | Smaller (zero dependencies) |
| **Learning Curve**   | Complex (hooks, rules, patterns) | Simple (just signals)       |

### 🧠 Simpler Mental Model

**React Hooks Complexity:**

```typescript
// React - multiple hooks, dependency arrays, cleanup
useEffect(() => {
  const timer = setInterval(() => {
    setCount((c) => c + 1);
  }, 1000);
  return () => clearInterval(timer);
}, []); // Don't forget dependencies!
```

**Tacit-DOM Simplicity:**

```typescript
// Tacit-DOM - just update the signal
const count = signal(0);
setInterval(() => count.set(count.get() + 1), 1000);
// DOM updates automatically, no cleanup needed
```

### 🎭 No More Re-render Roulette

In React, changing any state re-renders the entire component. With Tacit-DOM, only DOM elements that depend on a specific signal will update:

```typescript
// React: Changing count re-renders everything
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: 'John' });

// Tacit-DOM: Only count-dependent elements update
const count = signal(0);
const user = signal({ name: 'John' });
// Elements using count update when count changes
// Elements using user update when user changes
```

### 🌍 Global State Without Complexity

**React State Management:**

```typescript
// React - Context, Providers, Redux, etc.
const MyContext = createContext();
const MyProvider = ({ children }) => {
  const [state, setState] = useState({});
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
};
```

**Tacit-DOM Simplicity:**

```typescript
// Tacit-DOM - just create a signal anywhere
const globalState = signal({ user: null, theme: 'light' });
// Use it anywhere in your app, no providers needed
```

## 📦 Installation

```bash
npm install tacit-dom
```

### Requirements

- **Node.js**: 16.0.0 or higher
- **TypeScript**: 4.5.0 or higher (recommended)
- **Modern Browsers**: ES2020+ support

## 🚀 Quick Start

Ready to build reactive apps without the React complexity? Dive in! 🏊‍♂️

_No virtual DOM, no reconciliation, no provider hell - just pure, simple reactivity!_

## 🧩 Components

Tacit-DOM provides a simple and intuitive component system using the `component` function. Components automatically re-render when their dependencies change, and they support TypeScript props for type safety.

### Basic Component

```typescript
import { component, div, h1, p, button, signal, render } from 'tacit-dom';

const Counter = component(() => {
  const count = signal(0);

  return div(
    { className: 'counter' },
    h1('Counter'),
    p(`Count: ${count.get()}`),
    button({ onclick: () => count.set(count.get() + 1) }, 'Increment'),
  );
});

render(Counter, document.getElementById('app'));
```

### Component with Props

```typescript
const Greeting = component<{ name: string; greeting?: string }>((props) => {
  return div({ className: 'greeting' }, h1(`${props?.greeting || 'Hello'}, ${props?.name || 'World'}!`));
});

// Usage
render(Greeting({ name: 'Alice', greeting: 'Welcome' }), document.getElementById('greeting'));
```

### Component with Local State

```typescript
const UserProfile = component(() => {
  const user = signal({ name: 'John', email: 'john@example.com' });
  const isEditing = signal(false);

  const toggleEdit = () => isEditing.set(!isEditing.get());

  return div(
    { className: 'profile' },
    h1('User Profile'),
    isEditing.get()
      ? div(
          input({
            value: user.get().name,
            oninput: (e) => user.set({ ...user.get(), name: e.target.value }),
          }),
          input({
            value: user.get().email,
            oninput: (e) => user.set({ ...user.get(), email: e.target.value }),
          }),
          button({ onclick: toggleEdit }, 'Save'),
        )
      : div(p(`Name: ${user.get().name}`), p(`Email: ${user.get().email}`), button({ onclick: toggleEdit }, 'Edit')),
  );
});
```

### Component with Conditional Rendering using `when`

```typescript
const ConditionalCounter = component(() => {
  const count = signal(0);
  const isPositive = computed(() => count.get() > 0);
  const isEven = computed(() => count.get() % 2 === 0);

  return div(
    { className: 'conditional-counter' },
    h1('Conditional Counter'),
    p(`Count: ${count.get()}`),

    // Use when() for conditional rendering
    when(isPositive, () => div({ className: 'positive-message' }, '✅ Count is positive!')),

    when(isEven, () => div({ className: 'even-message' }, '🔢 Count is even!')),

    when(
      computed(() => count.get() === 0),
      () => div({ className: 'zero-message' }, '🎯 Count is zero!'),
    ),

    button({ onclick: () => count.set(count.get() + 1) }, 'Increment'),
    button({ onclick: () => count.set(count.get() - 1) }, 'Decrement'),
  );
});
```

### Component using `fragment` for Multiple Elements

```typescript
const MultiElementComponent = component(() => {
  const showHeader = signal(true);
  const showContent = signal(true);
  const showFooter = signal(true);

  // Use fragment to return multiple elements without a wrapper div
  return fragment(
    // Conditional header
    when(showHeader, () => header({ className: 'app-header' }, h1('My App'))),

    // Conditional content
    when(showContent, () =>
      main({ className: 'app-content' }, p('This is the main content area'), p('You can have multiple elements here')),
    ),

    // Conditional footer
    when(showFooter, () => footer({ className: 'app-footer' }, p('© 2024 My App'))),

    // Always visible controls
    div(
      { className: 'controls' },
      button({ onclick: () => showHeader.set(!showHeader.get()) }, 'Toggle Header'),
      button({ onclick: () => showContent.set(!showContent.get()) }, 'Toggle Content'),
      button({ onclick: () => showFooter.set(!showFooter.get()) }, 'Toggle Footer'),
    ),
  );
});
```

### Complex Component with `when` and `fragment`

```typescript
const Dashboard = component(() => {
  const user = signal({ name: 'Alice', role: 'admin', isOnline: true });
  const notifications = signal([]);
  const isLoading = signal(false);

  const isAdmin = computed(() => user.get().role === 'admin');
  const hasNotifications = computed(() => notifications.get().length > 0);

  return fragment(
    // Header section
    header(
      { className: 'dashboard-header' },
      h1(`Welcome, ${user.get().name}`),
      when(isOnline, () => span({ className: 'status online' }, '🟢 Online')),
      when(!isOnline, () => span({ className: 'status offline' }, '🔴 Offline')),
    ),

    // Main content
    main(
      { className: 'dashboard-content' },
      // Admin panel - only visible to admins
      when(isAdmin, () =>
        section(
          { className: 'admin-panel' },
          h2('Admin Panel'),
          button({ onclick: () => console.log('Admin action') }, 'Admin Action'),
        ),
      ),

      // Notifications - only visible when there are notifications
      when(hasNotifications, () =>
        section(
          { className: 'notifications' },
          h2('Notifications'),
          ...notifications.get().map((notification) => div({ className: 'notification' }, notification.message)),
        ),
      ),

      // Loading state
      when(isLoading, () => div({ className: 'loading' }, 'Loading...')),
    ),

    // Footer
    footer({ className: 'dashboard-footer' }, p('Dashboard v1.0')),
  );
});
```

```typescript
import { signal, computed, component, div, h1, p, button, render } from 'tacit-dom';

// Create global reactive signals - accessible anywhere in your app
const count = signal(0);
const user = signal({ name: 'John', email: 'john@example.com' });

// Create a reactive component without props
const Counter = component(() => {
  // Create a local computed value
  const doubleCount = computed(() => count.get() * 2);

  // Create a reactive element
  return div(
    { className: 'counter' },
    h1('Counter Example'),
    p('Count: ', count),
    p('Double Count: ', doubleCount),
    p('User: ', user.get().name),
    button(
      {
        onclick: () => count.set(count.get() + 1),
      },
      'Increment',
    ),
  );
});

// Create a component with typed props
const Greeting = component<{ name: string; greeting?: string }>((props) => {
  return div(
    { className: 'greeting' },
    h1(`${props?.greeting || 'Hello'}, ${props?.name || 'World'}!`),
    p('User: ', user.get().name),
    p('Email: ', user.get().email),
  );
});

// Another component can access the same global state
const UserProfile = component(() => {
  return div(
    { className: 'profile' },
    h1('User Profile'),
    p('Name: ', user.get().name),
    p('Email: ', user.get().email),
  );
});

// Render components to DOM
render(Counter, document.getElementById('app'));
render(Greeting({ name: 'Alice', greeting: 'Welcome' }), document.getElementById('greeting'));
render(UserProfile, document.getElementById('profile'));
```

## 🎭 Conditional and List Rendering

Tacit-DOM provides powerful utilities for conditional rendering and list management that automatically update when signals change.

### Conditional Rendering with `when`

```typescript
import { when, signal, div, h1, computed, component } from 'tacit-dom';

// Basic conditional rendering
const isVisible = signal(true);
const element = when(isVisible, () => div('This is visible'));

// With computed values
const count = signal(0);
const isPositive = computed(() => count.get() > 0);
const element = when(isPositive, () => div(`Count is positive: ${count.get()}`));

// Inside components - perfect for conditional UI elements
const StatusIndicator = component(() => {
  const status = signal('loading');

  return div(
    when(status === 'loading', () => div('⏳ Loading...')),
    when(status === 'success', () => div('✅ Success!')),
    when(status === 'error', () => div('❌ Error occurred')),
  );
});

// Complex conditions with computed values
const UserCard = component(() => {
  const user = signal({ name: 'John', age: 25, isVerified: true });
  const isAdult = computed(() => user.get().age >= 18);
  const showVerification = computed(() => user.get().isVerified && isAdult.get());

  return div(
    h1(user.get().name),
    when(isAdult, () => p('Adult user')),
    when(showVerification, () => div({ className: 'verified-badge' }, '✓ Verified')),
  );
});
```

### List Rendering with `map`

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

### Multiple Elements with `fragment`

```typescript
import { fragment, div, h1, p, signal, when, component } from 'tacit-dom';

// Return multiple elements without a wrapper
const MyComponent = component(() => {
  const showHeader = signal(true);
  const showFooter = signal(true);

  return fragment(
    when(showHeader, () => h1('Header')),
    div('Main content'),
    when(showFooter, () => div('Footer')),
  );
});

// Fragment is perfect for returning multiple top-level elements
const Navigation = component(() => {
  const isLoggedIn = signal(false);

  return fragment(
    nav(
      { className: 'main-nav' },
      a({ href: '/' }, 'Home'),
      a({ href: '/about' }, 'About'),
      when(isLoggedIn, () => a({ href: '/profile' }, 'Profile')),
      when(
        isLoggedIn,
        () => a({ href: '/login' }, 'Login'),
        (x) => !x,
      ),
    ),
    // No wrapper div needed - elements are siblings
    when(isLoggedIn, () => div({ className: 'user-info' }, 'Welcome back!')),
  );
});
```

## 🛠️ Development

For development setup, building, testing, and project structure, see [DEVELOPMENT.md](DEVELOPMENT.md).

## 📚 Documentation

Tacit-DOM provides comprehensive documentation covering all aspects of the library. The documentation is organized into logical sections to help you find what you need quickly.

### 🚀 Getting Started

- **[📖 API Reference](docs/API.md)**: Complete API documentation with examples
- **[🔄 Signals Guide](docs/SIGNALS.md)**: Learn about reactive signals, the foundation of Tacit-DOM
- **[💡 Signals Usage Guide](docs/SIGNAL_USAGE_GUIDE.md)**: Practical examples and common patterns

### 🎨 DOM & Components

- **[🌐 DOM Internals](docs/DOM_INTERNALS.md)**: Deep dive into DOM manipulation and reactive updates
- **[🔒 Strongly Typed Props](docs/STRONGLY_TYPED_PROPS.md)**: TypeScript type safety for HTML elements
- **[🎨 ClassNames Utility](docs/CLASSNAMES.md)**: Dynamic CSS class management (recommended)
- **[🔄 Migration Guide](docs/MIGRATION_GUIDE.md)**: Migrate from deprecated `className` to `classNames`

### 🔧 Advanced Features

- **[🌐 Router Guide](docs/ROUTER.md)**: Client-side routing with navigation and error handling
- **[🌍 i18n Guide](docs/I18N.md)**: Internationalization and localization support
- **[🚨 Error Boundaries](docs/ERROR_BOUNDARIES.md)**: Graceful error handling and recovery ⚠️ **Experimental**

### 🛠️ Development & Internals

- **[⚙️ Development Guide](docs/DEVELOPMENT.md)**: Setup, building, testing, and contributing
- **[🔍 Signal Internals](docs/SIGNAL_INTERNALS.md)**: Technical implementation details

### 📚 Component Naming Convention

Tacit-DOM uses a clean, intuitive naming convention:

| Function               | Type               | Description                                             |
| ---------------------- | ------------------ | ------------------------------------------------------- |
| **`component<P>`**     | `Component<P>`     | Create reactive components                              |
| **`errorBoundary<P>`** | `ErrorBoundary<P>` | Wrap components with error handling ⚠️ **Experimental** |

```typescript
import { component, Component, div } from 'tacit-dom';

// Component without props
const SimpleCounter = component(() => {
  return div('Hello World');
});

// Component with typed props
const Greeting = component<{ name: string }>((props) => {
  return div(`Hello, ${props?.name || 'World'}!`);
});

// Error boundary example (⚠️ Experimental)
const SafeGreeting = errorBoundary(Greeting, {
  fallback: (error) => div('Error loading greeting'),
  onError: (error) => console.error('Greeting error:', error),
});
```

## 🛠️ API Reference

For detailed API documentation, see [API.md](docs/API.md).

### Core Functions

#### `signal<T>(initialValue: T): Signal<T>`

Creates a reactive signal with an initial value.

```typescript
const count = signal(0);
count.set(5); // Update value
console.log(count.get()); // Get current value
```

#### `computed<T>(fn: () => T): Computed<T>`

Creates a computed value that automatically updates when dependencies change.

```typescript
const doubleCount = computed(() => count.get() * 2);
```

#### `render(element: HTMLElement, container: HTMLElement): void`

Renders a reactive element into a DOM container.

```typescript
render(Counter(), document.getElementById('app'));
```

### DOM Elements

All HTML elements are available as factory functions:

```typescript
import { div, h1, h2, h3, p, button, input, label, span, a } from 'tacit-dom';

const element = div(
  { classNames: 'container' },
  h1('Hello World'),
  h2('Subtitle'),
  h3('Section'),
  p('This is a paragraph'),
  button({ onclick: handleClick }, 'Click me'),
  input({ type: 'text', placeholder: 'Enter text' }),
  label({ for: 'input-id' }, 'Input Label'),
);
```

### Conditional and List Rendering

Tacit-DOM provides powerful utilities for conditional rendering and list management:

#### `when<T>(condition: Signal<T> | Computed<T> | T, renderFn: () => HTMLElement): HTMLElement`

Conditionally renders content based on a signal's truthiness:

```typescript
const isVisible = signal(true);
const element = when(isVisible, () => div('This is visible'));

// With computed values
const count = signal(0);
const isPositive = computed(() => count.get() > 0);
const element = when(isPositive, () => div(`Count is positive: ${count.get()}`));
```

#### `map<T>(arraySignal: Signal<T[]> | Computed<T[]> | T[], renderFn: (item: T, index: number) => HTMLElement, selector?: (item: T, index: number) => boolean): HTMLElement`

Renders a list of elements from an array signal with optional filtering:

```typescript
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

#### `fragment(...children: (string | number | HTMLElement)[]): DocumentFragment`

Creates a document fragment for rendering multiple elements without a wrapper:

```typescript
const MyComponent = component(() => {
  const showHeader = signal(true);
  const showFooter = signal(true);

  return fragment(
    when(showHeader, () => h1('Header')),
    div('Main content'),
    when(showFooter, () => div('Footer')),
  );
});
```

### Error Boundaries ⚠️ **Experimental**

> **Note**: Error boundaries are currently experimental and may have breaking changes in future releases. The API is subject to change based on community feedback and usage patterns.

#### `errorBoundary<P>(Component: Component<P>, options: { fallback: (error: Error, errorInfo?: any) => HTMLElement; onError?: (error: Error, errorInfo?: any) => void }): Component<P>`

Wraps components with error handling capabilities:

```typescript
const SafeComponent = errorBoundary(MyComponent, {
  fallback: (error) => div('Something went wrong!'),
  onError: (error) => console.error('Component error:', error),
});
```

## 🎯 Examples

The `examples/` directory contains comprehensive examples demonstrating Tacit-DOM features. Each example is designed to showcase specific aspects of the library and can be run independently.

### 🚀 Getting Started Examples

- **📊 [Signals](/examples/signals)**: Basic reactive signals with automatic UI updates
- **🎨 [ClassNames](/examples/classnames)**: Dynamic CSS class management utility
- **🧩 [Component Props](/examples/props-demo)**: Strongly-typed components with props

### 🔧 Advanced Features

- **🌐 [Router](/examples/router)**: Client-side routing with navigation and error handling
- **🌍 [i18n](/examples/i18n)**: Internationalization with reactive translations
- **🚨 [Error Boundary](/examples/error-boundary)**: Graceful error handling and recovery ⚠️ **Experimental**
- **🔄 [Nested Signals](/examples/nested-signals)**: Complex signal relationships and patterns

### 🎮 Interactive Demos

- **⏱️ [Stopwatch](/examples/stopwatch)**: Real-time timer with reactive updates
- **🌳 [Tree](/examples/tree)**: Interactive tree component with expand/collapse
- **🎲 [Complex Signals](/examples/signals-complex)**: Advanced state management patterns

### 🚀 Running Examples

#### Quick Start (All Examples)

```bash
# Run all examples simultaneously
./examples/run-all.sh
```

#### Individual Examples

```bash
# Navigate to any example directory
cd examples/signals

# Install dependencies
npm install

# Start development server
npm run dev
```

### 🎯 What Each Example Demonstrates

- **Reactive Signals**: Global state management without providers or context
- **Store Pattern**: Centralized state management with persistent signals
- **Computed Values**: Automatic dependency tracking and derived state
- **Event Handling**: Built-in DOM event support with reactive updates
- **Type Safety**: Full TypeScript support with strongly typed props
- **Routing**: Client-side routing with dynamic route handling
- **Error Boundaries**: Graceful error handling and recovery
- **Performance**: Direct DOM updates without virtual DOM overhead

For detailed information about each example, see the [Examples README](examples/README.md).

## 🚀 Performance & Benchmarks

Tacit-DOM is designed for performance from the ground up:

### ⚡ Key Performance Features

- **🚫 No Virtual DOM**: Direct DOM updates eliminate reconciliation overhead
- **🎯 Granular Updates**: Only affected DOM elements update, not entire components
- **🧠 Smart Dependency Tracking**: Automatic dependency management without manual arrays
- **📦 Zero Dependencies**: Minimal bundle size with no external runtime overhead
- **🔄 Efficient Signal System**: Optimized signal updates with batching support

### 📊 Performance Comparison

| Metric              | React                      | Tacit-DOM                 |
| ------------------- | -------------------------- | ------------------------- |
| **Bundle Size**     | ~42KB (React 18)           | ~15KB (estimated)         |
| **Update Overhead** | Virtual DOM reconciliation | Direct DOM updates        |
| **Memory Usage**    | Component tree + VDOM      | Signal subscriptions only |
| **Startup Time**    | Framework initialization   | Minimal setup             |

> **Note**: These are estimated metrics based on the library's architecture. Actual performance may vary based on use case and implementation.

## 🤝 Contributing

Tacit-DOM is an experimental project exploring reactive programming patterns. Contributions are welcome!

### 🎯 Areas for Contribution

- **🧪 Testing**: Improve test coverage and add integration tests
- **📚 Documentation**: Enhance guides and add more examples
- **🚀 Performance**: Optimize signal updates and DOM operations
- **🔧 Tooling**: Improve build tools and development experience
- **🌐 Examples**: Create more comprehensive example applications

### 🛠️ Development Setup

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Tacit-DOM** - Because sometimes the simplest solution is the best solution.

_Built with ❤️ and a lot of 🧪 experimentation_

</div>
