<div align="center">

# ⚡ Reactive-DOM

> A React-like library with reactive signals and computed values for building dynamic web applications

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
- **🧩 Component Pattern**: Build components using a familiar JSX-like syntax
- **🎯 Event Handling**: Built-in support for DOM events
- **🔒 TypeScript Support**: Full TypeScript support with type safety
- **🎨 CSS Modules**: Scoped styling with theme support
- **🌓 Theme System**: Light, dark, and high-contrast themes
- **🧹 Automatic Cleanup**: Prevents memory leaks with smart cleanup
- **📦 Zero Dependencies**: Lightweight with no external dependencies
- **⚡ Optimized Bundles**: Multiple formats (ESM, UMD, CJS) with Rollup
- **🎯 Tree-shaking**: Individual modules for optimal bundling

## 📦 Installation

```bash
npm install reactive-dom
```

## 🚀 Quick Start

```typescript
import { signal, computed, div, h1, p, button, render } from 'reactive-dom';

// Create reactive signals
const count = signal(0);
const doubleCount = computed(() => count.get() * 2);

// Create a component
const Counter = () => {
  return div(
    { className: 'counter' },
    h1({ children: 'Counter Example' }),
    p({ children: `Count: ${count}` }),
    p({ children: `Double Count: ${doubleCount}` }),
    button({ onClick: () => count.set(count.get() + 1), children: 'Increment' })
  );
};

// Render to DOM
const app = document.getElementById('app');
if (app) {
  render(Counter(), app);
}
```

## 📁 Project Structure

```
reactive-dom/
├── src/                    # Source code
│   ├── reactivity.ts       # Reactive signals and computed values
│   ├── reactive-dom.ts     # DOM element factories
│   ├── class-names.ts      # CSS class name utilities
│   └── index.ts           # Main exports
├── dist/                   # Built distribution files
│   ├── reactive-dom.esm.js # ES Module bundle (2.47 KB gzipped)
│   ├── reactive-dom.umd.js # UMD bundle (2.57 KB gzipped)
│   ├── reactive-dom.cjs.js # CommonJS bundle (2.47 KB gzipped)
│   ├── *.d.ts             # TypeScript declarations
│   └── modules/           # Individual modules for tree-shaking
├── examples/               # Examples and demos
│   ├── app.ts             # Main example application
│   ├── app.module.css     # CSS modules example
│   └── css.d.ts           # CSS module type declarations
├── docs/                   # Documentation
├── package.json            # NPM configuration
├── tsconfig.json          # TypeScript configuration
├── rollup.config.js       # Rollup build configuration
├── vite.config.ts         # Development server config
└── README.md              # This file
```

## 🛠️ Development

### Running the Development Server

```bash
# Start the development server for examples (port 5173)
npm run dev:examples

# Preview examples
npm run preview:examples
```

The development server will be available at `http://localhost:5173`

### Building the Library

```bash
# Build the library with Rollup (recommended)
npm run build

# Build with TypeScript only
npm run build:tsc

# Watch for changes
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm test
```

## 📚 API Reference

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
  button({ onClick: handleClick, children: 'Click me' })
);
```

## 🎯 Examples

Check out the example in the `examples/` directory:

- **Random Number Generator**: Demonstrates reactive signals with a button that generates random numbers
- **CSS Modules**: Shows how to use CSS modules with reactive styling
- **Event Handling**: Basic event handling with reactive state

To run the examples:

```bash
npm run dev:examples
```

Then open `http://localhost:5173` in your browser.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
