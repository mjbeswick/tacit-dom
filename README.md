<div align="center">

# ⚡ Reactive-DOM

> A React-like library with reactive signals and computed values for building dynamic web applications

</div>

<div align="center">

⚠️ **Proof of Concept Warning** ⚠️

This project is currently a **proof of concept** and is **not suitable for production use**. It's designed to explore reactive programming patterns and demonstrate an alternative approach to React. Use at your own risk!

</div>

[![NPM Version](https://img.shields.io/npm/v/reactive-dom.svg)](https://www.npmjs.com/package/reactive-dom)
[![License](https://img.shields.io/npm/l/reactive-dom.svg)](https://github.com/your-username/reactive-dom/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/reactive-dom/ci.yml?branch=main)](https://github.com/your-username/reactive-dom/actions)

</div>

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **⚡ Reactive Signals**: Create reactive state that automatically updates when dependencies change
- **🧮 Computed Values**: Derive values from signals with automatic dependency tracking
- **🌍 Global State Management**: Create global state anywhere without providers, context, or complex setup
- **🚫 No Virtual DOM**: Direct DOM updates without the overhead of virtual DOM reconciliation
- **🧩 Component Pattern**: Build components using a familiar JSX-like syntax
- **🎯 Event Handling**: Built-in support for DOM events
- **🔒 TypeScript Support**: Full TypeScript support with type safety
- **🎨 CSS Modules**: Scoped styling with theme support
- **🌓 Theme System**: Light, dark, and high-contrast themes
- **🧹 Automatic Cleanup**: Prevents memory leaks with smart cleanup
- **📦 Zero Dependencies**: Lightweight with no external dependencies
- **⚡ Optimized Bundles**: Multiple formats (ESM, UMD, CJS) with Rollup
- **🎯 Tree-shaking**: Individual modules for optimal bundling

## 🚀 Why Reactive-DOM?

### Signals vs React Hooks

**Signals are fundamentally better than React hooks because:**

- **🎯 Granular Updates**: Signals update only the specific DOM elements that depend on them, not entire components
- **⚡ No Re-renders**: Unlike React's component re-rendering, signals update the DOM directly without virtual DOM overhead
- **🧠 Automatic Dependency Tracking**: Signals automatically track dependencies without manual dependency arrays
- **🔧 Simpler Mental Model**: No need to understand hooks rules, dependency arrays, or component lifecycle
- **🚫 No useEffect**: No need for useEffect which creates unnecessary complexity and side effect management
- **📦 Smaller Bundle**: No virtual DOM, reconciliation, or complex state management overhead
- **🎨 Better Performance**: Direct DOM updates are faster than React's render cycle
- **🌍 Global State Without Providers**: Create global state anywhere without complex provider patterns or context setup

### Pure TypeScript vs JSX

**Pure TypeScript is better than JSX because:**

- **🔒 Type Safety**: Full TypeScript support with compile-time type checking
- **🧹 No Build Step**: No need for JSX transformation or Babel configuration
- **📦 Smaller Bundle**: No JSX runtime or transformation overhead
- **🎯 Better IDE Support**: Full IntelliSense, autocomplete, and refactoring support
- **🔧 Simpler Tooling**: No need for JSX plugins, Babel, or special build configurations
- **📚 Familiar Syntax**: Uses standard JavaScript/TypeScript function calls
- **🎨 More Flexible**: Easier to compose, transform, and manipulate programmatically
- **✍️ Less Code**: More concise and easier to write without verbose JSX syntax
- **🚫 No XML Recreation**: JSX is just trying to recreate XML in TypeScript, which has no advantages aside from looking like HTML, but is less efficient

## 📦 Installation

```bash
npm install reactive-dom
```

## 🚀 Quick Start

Ready to build reactive apps without the React complexity? Let's dive in! 🏊‍♂️

```typescript
import { signal, computed, div, h1, p, button, render } from 'reactive-dom';

// Create global reactive signals - accessible anywhere in your app
const count = signal(0);
const user = signal({ name: 'John', email: 'john@example.com' });

// Create a component
const Counter = () => {
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
        onClick: () => count.set(count.get() + 1),
      },
      'Increment',
    ),
  );
};

// Another component can access the same global state
const UserProfile = () => {
  return div(
    { className: 'profile' },
    h1('User Profile'),
    p('Name: ', user.get().name),
    p('Email: ', user.get().email),
  );
};

// Render to DOM
render(Counter(), document.getElementById('app'));
```

## 🛠️ Development

For development setup, building, testing, and project structure, see [DEVELOPMENT.md](DEVELOPMENT.md).

## 📚 API Reference

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
import { div, h1, p, button, input, span } from 'reactive-dom';

const element = div(
  { className: 'container' },
  h1({ children: 'Hello World' }),
  p({ children: 'This is a paragraph' }),
  button({ onClick: handleClick, children: 'Click me' }),
);
```

## 🎯 Examples

The `examples/` directory contains comprehensive examples demonstrating Reactive DOM features:

### Available Examples

- **🔢 Counter** (`/counter`): Basic reactive state management with increment/decrement buttons
- **🎲 Random Generator** (`/random-generator`): Signal updates with automatic UI re-rendering
- **🐛 Debug** (`/debug`): Reactive signals with disabled states and real-time logging
- **🌐 Router** (`/router`): Advanced client-side routing with navigation and error handling
- **🔒 Strongly Typed Props** (`/strongly-typed-props`): Demonstrates TypeScript type safety for all HTML element props

### Example Features

Each example demonstrates different aspects of Reactive DOM:

- **Reactive Signals**: Global state management without providers or context
- **Computed Values**: Automatic dependency tracking and derived state
- **Event Handling**: Built-in DOM event support with reactive updates
- **CSS Modules**: Scoped styling with theme support
- **Type Safety**: Full TypeScript support with strongly typed props
- **Routing**: Client-side routing with dynamic route handling
- **Error Boundaries**: Graceful error handling and recovery

### Running Examples

```bash
# Run all examples simultaneously
./examples/run-all.sh

# Or run individual examples
cd examples/counter && npm install && npm run dev
cd examples/router && npm install && npm run dev
cd examples/strongly-typed-props && npm install && npm run dev
```

### Example Ports

Each example runs on a different port:

- **Counter**: `http://localhost:5173`
- **Debug**: `http://localhost:5174`
- **Random Generator**: `http://localhost:5175`
- **Router**: `http://localhost:5176`
- **Strongly Typed Props**: `http://localhost:3000`

For detailed information about each example, see the [Examples README](examples/README.md).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
