<div align="center">

# ⚡ Domitor

> A React-like library with reactive signals and computed values for building dynamic web applications

</div>

<div align="center">

⚠️ **Proof of Concept Warning** ⚠️

This project is currently a **proof of concept** and is **not suitable for production use**. It's designed to explore reactive programming patterns and demonstrate an alternative approach to React.

_Think of it as a "what if React was simpler?" experiment. Use at your own risk! 🧪_

</div>

[![NPM Version](https://img.shields.io/npm/v/domitor.svg)](https://www.npmjs.com/package/domitor)
[![License](https://img.shields.io/npm/l/domitor.svg)](https://github.com/your-username/domitor/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/domitor/ci.yml?branch=main)](https://github.com/your-username/domitor/actions)

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

## 🚀 Why Domitor?

### The React Reality Check 🤔

Look, React is great and all... but let's be honest here. It's become the JavaScript equivalent of that friend who brings a full camping setup to a backyard BBQ. Sure, it works, but do you really need a virtual DOM, reconciliation algorithms, and a complex state management system just to update a counter?

**We're not saying React is bad** - we're just saying it's solving problems that don't always need solving. Sometimes you just want to update the DOM directly without the overhead of a virtual DOM, reconciliation, and the entire React ecosystem. 🎯

### Signals vs React Hooks: The Showdown ⚔️

**Signals are fundamentally better than React hooks because:**

- **🎯 Granular Updates**: Signals update only the specific DOM elements that depend on them, not entire components (no more "why is my entire app re-rendering?" moments)
- **⚡ No Re-renders**: Unlike React's component re-rendering, signals update the DOM directly without virtual DOM overhead (because who needs a virtual DOM when you can just... update the DOM?)
- **🧠 Automatic Dependency Tracking**: Signals automatically track dependencies without manual dependency arrays (goodbye, `useEffect` dependency hell!)
- **🔧 Simpler Mental Model**: No need to understand hooks rules, dependency arrays, or component lifecycle (your brain will thank you)
- **🚫 No useEffect**: No need for useEffect which creates unnecessary complexity and side effect management (one less hook to worry about!)
- **📦 Smaller Bundle**: No virtual DOM, reconciliation, or complex state management overhead (your users will thank you)
- **🎨 Better Performance**: Direct DOM updates are faster than React's render cycle (because sometimes the direct route is the best route)
- **🌍 Global State Without Providers**: Create global state anywhere without complex provider patterns or context setup (no more provider nesting nightmares!)

### Pure TypeScript vs JSX: The Battle Continues 🥊

**Pure TypeScript is better than JSX because:**

- **🔒 Type Safety**: Full TypeScript support with compile-time type checking (catch bugs before they catch you)
- **🧹 No Build Step**: No need for JSX transformation or Babel configuration (one less thing to configure!)
- **📦 Smaller Bundle**: No JSX runtime or transformation overhead (every byte counts)
- **🎯 Better IDE Support**: Full IntelliSense, autocomplete, and refactoring support (your IDE will love you)
- **🔧 Simpler Tooling**: No need for JSX plugins, Babel, or special build configurations (less configuration = more coding)
- **📚 Familiar Syntax**: Uses standard JavaScript/TypeScript function calls (no new syntax to learn!)
- **🎨 More Flexible**: Easier to compose, transform, and manipulate programmatically (power to the programmer!)
- **✍️ Less Code**: More concise and easier to write without verbose JSX syntax (less typing, more doing)
- **🚫 No XML Recreation**: JSX is just trying to recreate XML in TypeScript, which has no advantages aside from looking like HTML, but is less efficient (because who said we needed XML in our JavaScript?)

### The Bandwagon Effect 🎠

Let's talk about the elephant in the room: **the React bandwagon effect**.

React is everywhere. It's in job postings, tutorials, bootcamps, and every developer's LinkedIn profile. But here's the thing - just because everyone's using it doesn't mean it's always the right tool for the job.

Sometimes you need a sledgehammer (React), and sometimes you just need a regular hammer (Domitor). 🛠️

**Domitor is for developers who:**

- Want to build reactive UIs without the React complexity
- Prefer direct DOM manipulation over virtual DOM abstraction
- Value simplicity and performance over ecosystem size
- Don't want to learn another framework's quirks and gotchas
- Believe that sometimes less is more

Remember: **The best tool is the one that gets the job done with the least amount of complexity.** Sometimes that's React, and sometimes it's Domitor. 🤷‍♂️

### The Hook Horror Show 🎭

Let's talk about the elephant in the React room: **hooks are a mess**.

#### The useEffect Nightmare 😱

`useEffect` is like that friend who always shows up to your party but never knows when to leave. Here's what you're dealing with:

```typescript
// React way - the useEffect dependency hell
useEffect(() => {
  // Do something
}, [dependency1, dependency2, dependency3]); // Did I forget one? 🤔

// Oh wait, I need to add another dependency...
useEffect(() => {
  // Do something else
}, [dependency1, dependency2, dependency3, dependency4]); // Still missing something?

// And another one for cleanup...
useEffect(() => {
  const timer = setInterval(() => {
    // Do something
  }, 1000);

  return () => clearInterval(timer); // Don't forget cleanup!
}, [dependency1, dependency2, dependency3, dependency4]); // Wait, what was I doing again?
```

**vs Domitor signals:**

```typescript
// Domitor way - just update the signal
const timer = signal(0);

setInterval(() => {
  timer.set(timer.get() + 1);
}, 1000);

// That's it. No cleanup, no dependencies, no useEffect hell.
// The DOM updates automatically when the signal changes.
```

#### Hook Rules: The Developer's Burden 📚

With React hooks, you need to remember:

- ✅ Only call hooks at the top level
- ✅ Don't call hooks inside loops, conditions, or nested functions
- ✅ Always include all dependencies in useEffect
- ✅ Don't forget to clean up side effects
- ✅ Make sure your dependency array is exhaustive
- ✅ Don't create objects in the dependency array (unless you memoize them)
- ✅ Remember that useEffect runs after every render
- ✅ Don't forget that useEffect can run multiple times
- ✅ Make sure you're not causing infinite re-renders
- ✅ Remember that useEffect cleanup runs before the next effect

**With Domitor signals:**

- ✅ Just use the signal
- ✅ That's it

#### The Re-render Roulette 🎰

In React, you never know what's going to re-render:

```typescript
// React - will this re-render? Who knows!
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: 'John' });

// Does changing count re-render the user display?
// Does changing user re-render the count display?
// The answer: YES, because React re-renders the entire component!
```

**vs Domitor:**

```typescript
// Domitor - only what depends on the signal updates
const count = signal(0);
const user = signal({ name: 'John' });

// Only elements that depend on count will update when count changes
// Only elements that depend on user will update when user changes
// No unnecessary re-renders, no guessing games!
```

#### The State Management Circus 🎪

React state management is like trying to organize a circus where all the performers are connected by invisible strings:

```typescript
// React - state management hell
const [localState, setLocalState] = useState(0);
const [globalState, setGlobalState] = useState({});
const [formState, setFormState] = useState({});
const [uiState, setUiState] = useState({});

// Need to share state? Time for Context!
const MyContext = createContext();
const MyProvider = ({ children }) => {
  const [sharedState, setSharedState] = useState({});
  return (
    <MyContext.Provider value={{ sharedState, setSharedState }}>
      {children}
    </MyContext.Provider>
  );
};

// Or Redux, or Zustand, or Recoil, or...
```

**vs Domitor:**

```typescript
// Domitor - just create a signal anywhere
const count = signal(0);
const user = signal({ name: 'John' });

// Use it anywhere in your app, no providers needed
// No context, no reducers, no complex state management
```

**The bottom line:** Hooks are like trying to solve a Rubik's cube blindfolded while juggling flaming torches. Signals are like having a magic wand that just works. ✨

## 📦 Installation

```bash
npm install domitor
```

## 🚀 Quick Start

Ready to build reactive apps without the React complexity? Let's dive in! 🏊‍♂️

_No virtual DOM, no reconciliation, no provider hell - just pure, simple reactivity!_

```typescript
import { signal, computed, div, h1, p, button, render } from 'domitor';

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

### Documentation

- **[API Reference](docs/API.md)**: Complete API documentation
- **[Signals Guide](docs/SIGNALS.md)**: Comprehensive guide to reactive signals
- **[ClassNames Utility](docs/CLASSNAMES.md)**: Dynamic CSS class name utility
- **[Router Guide](docs/ROUTER.md)**: Client-side routing with navigation and error handling
- **[Development Guide](docs/DEVELOPMENT.md)**: Setup, building, testing, and contributing

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
import { div, h1, p, button, input, span } from 'domitor';

const element = div(
  { className: 'container' },
  h1({ children: 'Hello World' }),
  p({ children: 'This is a paragraph' }),
  button({ onClick: handleClick, children: 'Click me' }),
);
```

## 🎯 Examples

The `examples/` directory contains comprehensive examples demonstrating Domitor features:

### Available Examples

- **🎲 Random Generator** (`/random-generator`): Signal updates with automatic UI re-rendering
- **🐛 Debug** (`/debug`): Reactive signals with disabled states and real-time logging
- **🌐 Router** (`/router`): Advanced client-side routing with navigation and error handling
- **🔒 Strongly Typed Props** (`/strongly-typed-props`): Demonstrates TypeScript type safety for all HTML element props
- **⚡ Signals** (`/signals`): Unified signal API with preserved signals and reactive updates
- **🎨 ClassNames** (`/classnames`): Dynamic CSS class management utility

### Example Features

Each example demonstrates different aspects of Domitor:

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
cd examples/debug && npm install && npm run dev
cd examples/router && npm install && npm run dev
cd examples/strongly-typed-props && npm install && npm run dev
```

### Example Ports

Each example runs on a different port:

- **Debug**: `http://localhost:5173`
- **Random Generator**: `http://localhost:5174`
- **Router**: `http://localhost:5175`
- **Strongly Typed Props**: `http://localhost:5176`
- **Signals**: `http://localhost:5177`
- **ClassNames**: `http://localhost:5178`

For detailed information about each example, see the [Examples README](examples/README.md).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
