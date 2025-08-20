<div align="center">

# 🎯 Tacit-DOM

> **Implicit. Reactive. Powerful.**

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

</div>

## ⚠️ Project status

- **Experimental**: This library is still an experiment and subject to significant change.
- **Work in progress**: APIs are evolving and may change without notice.
- **Poor test coverage**: The current test coverage is limited and many areas are untested.
- **Expect breakage**: This will likely break badly if you try to build anything non‑trivial right now.

If you want something stable for production, this is not it (yet).

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Development](#-development)
- [License](#-license)

## ✨ Features

- **⚡ Reactive Signals**: Create reactive state that automatically updates when dependencies change
- **🧮 Computed Values**: Derive values from signals with automatic dependency tracking
- **🌍 Global State Management**: Create global state anywhere without providers, context, or complex setup
- **🚫 No Virtual DOM**: Direct DOM updates without the overhead of virtual DOM reconciliation
- **🧩 Component Pattern**: Build components using a familiar JSX-like syntax
- **🎯 Event Handling**: Built-in support for DOM events
- **🔒 TypeScript Support**: Full TypeScript support with type safety
- **🧹 Automatic Cleanup**: Prevents memory leaks with smart cleanup
- **📦 Zero Dependencies**: Lightweight with no external dependencies
- **⚡ Optimized Bundles**: Multiple formats (ESM, UMD, CJS) with Rollup
- **🎯 Tree-shaking**: Individual modules for optimal bundling
- **🌍 i18n Support**: Built-in internationalization with reactive translations

## 🚀 Why Tacit-DOM?

React has transformed web development, making it straightforward to build complex, interactive UIs with reusable components. Its approach to rendering and UI composition has become the industry standard. However, **state management in React has long been a source of frustration**. Whether it's prop drilling, context, Redux, hooks, or ongoing debates about the "best" way to handle state, managing state in React often feels unnecessarily complicated. Tacit-DOM is designed to change that—offering simple, reactive, and intuitive state management, so you can keep your UI in sync without the hassle of hooks or boilerplate.

React appears to have reached its peak. Meaningful progress likely requires a different foundation—not more layers on the same model. Recent releases skew toward additive features and ergonomic tweaks, while core pain points remain: state complexity, re-render churn, and mental overhead. Tacit-DOM explores a simpler, signal-first approach that addresses those fundamentals directly.

### The React Reality Check 🤔

React is great and all... but honestly, it's kind of like using a chainsaw to slice a loaf of bread. Sure, it gets the job done, but is all that machinery—virtual DOM, reconciliation, and a sprawling state system—really needed just to update a simple counter?

**This isn't to say React is bad** — it often solves problems that don't always need solving. Sometimes updating the DOM directly is enough, without the overhead of a virtual DOM, reconciliation, and the entire React ecosystem. 🎯

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
- **🚫 No XML Recreation**: JSX is just trying to recreate XML in TypeScript, which has no advantages aside from looking like HTML, but is less efficient (because who said JavaScript needed XML?)

### The React Inertia 🎠

Time to address the elephant in the room: **defaulting to React by habit**.

React is ubiquitous—in job postings, tutorials, bootcamps, and portfolios. That ubiquity can make it the default, but the default isn't always the right tool for the job.

Sometimes a sledgehammer (React) is perfect; sometimes a regular hammer (Tacit-DOM) is exactly right. 🛠️

**Tacit-DOM is for developers who:**

- Want to build reactive UIs without the React complexity
- Prefer direct DOM manipulation over virtual DOM abstraction
- Value simplicity and performance over ecosystem size
- Don't want to learn another framework's quirks and gotchas
- Believe that sometimes less is more

Remember: **The best tool is the one that gets the job done with the least amount of complexity.** Sometimes that's React, and sometimes it's Tacit-DOM. 🤷‍♂️

### The Hook Horror Show 🎭

Time to address the elephant in the React room: **hooks are a mess**.

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

**vs Tacit-DOM signals:**

```typescript
// Tacit-DOM way - just update the signal
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

**With Tacit-DOM signals:**

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

**vs Tacit-DOM:**

```typescript
// Tacit-DOM - only what depends on the signal updates
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

**vs Tacit-DOM:**

```typescript
// Tacit-DOM - just create a signal anywhere
const count = signal(0);
const user = signal({ name: 'John' });

// Use it anywhere in your app, no providers needed
// No context, no reducers, no complex state management
```

**The bottom line:** Hooks are like trying to solve a Rubik's cube blindfolded while juggling flaming torches. Signals are like having a magic wand that just works. ✨

## 📦 Installation

```bash
npm install tacit-dom
```

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
  return div(
    { className: 'greeting' },
    h1(`${props?.greeting || 'Hello'}, ${props?.name || 'World'}!`),
  );
});

// Usage
render(
  Greeting({ name: 'Alice', greeting: 'Welcome' }),
  document.getElementById('greeting'),
);
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
      : div(
          p(`Name: ${user.get().name}`),
          p(`Email: ${user.get().email}`),
          button({ onclick: toggleEdit }, 'Edit'),
        ),
  );
});
```

```typescript
import {
  signal,
  computed,
  component,
  div,
  h1,
  p,
  button,
  render,
} from 'tacit-dom';

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
render(
  Greeting({ name: 'Alice', greeting: 'Welcome' }),
  document.getElementById('greeting'),
);
render(UserProfile, document.getElementById('profile'));
```

## 🛠️ Development

For development setup, building, testing, and project structure, see [DEVELOPMENT.md](DEVELOPMENT.md).

## 📚 Documentation

Tacit-DOM provides comprehensive documentation covering all aspects of the library:

### Core Concepts

- **[Signals Guide](docs/SIGNALS.md)**: Learn about reactive signals, the foundation of Tacit-DOM
- **[Signals Usage Guide](docs/SIGNAL_USAGE_GUIDE.md)**: Practical examples and common patterns
- **[Signal Internals](docs/SIGNAL_INTERNALS.md)**: Technical implementation details

### DOM and Components

- **[DOM Internals](docs/DOM_INTERNALS.md)**: Deep dive into DOM manipulation and reactive updates
- **[Strongly Typed Props](docs/STRONGLY_TYPED_PROPS.md)**: TypeScript type safety for HTML elements
- **[ClassNames Utility](docs/CLASSNAMES.md)**: Dynamic CSS class management

#### Component Naming Convention

Tacit-DOM uses a clean, intuitive naming convention:

- **`component<P>`** - Function to create reactive components (alias for `createReactiveComponent`)
- **`Component<P>`** - Type for reactive components with props
- **`errorBoundary<P>`** - Function to wrap components with error handling capabilities

```typescript
import { component, Component } from 'tacit-dom';

// Component without props
const SimpleCounter = component(() => {
  return div('Hello World');
});

// Component with typed props
const Greeting: Component<{ name: string }> = component((props) => {
  return div(`Hello, ${props?.name || 'World'}!`);
});

// Usage
SimpleCounter();
Greeting({ name: 'Alice' });

// Error boundary example
const SafeGreeting = errorBoundary(Greeting, {
  fallback: (error) => div('Error loading greeting'),
  onError: (error) => console.error('Greeting error:', error),
});
```

### Advanced Features

- **[Router Guide](docs/ROUTER.md)**: Client-side routing with navigation and error handling

- **[i18n Guide](docs/I18N.md)**: Internationalization and localization support

### Development

- **[Development Guide](docs/DEVELOPMENT.md)**: Setup, building, testing, and contributing
- **[API Reference](docs/API.md)**: Complete API documentation

## 🛠️ API Reference

For detailed API documentation, see [API.md](docs/API.md).

### Documentation

- **[API Reference](docs/API.md)**: Complete API documentation
- **[Signals Guide](docs/SIGNALS.md)**: Comprehensive guide to reactive signals
- **[Signals Usage Guide](docs/SIGNAL_USAGE_GUIDE.md)**: Practical examples and patterns for using signals
- **[ClassNames Utility](docs/CLASSNAMES.md)**: Dynamic CSS class name utility
- **[Router Guide](docs/ROUTER.md)**: Client-side routing with navigation and error handling
- **[Development Guide](docs/DEVELOPMENT.md)**: Setup, building, testing, and contributing
- **[i18n Guide](docs/I18N.md)**: Internationalization and localization support
- **[DOM Internals](docs/DOM_INTERNALS.md)**: Deep dive into DOM manipulation and reactive updates
- **[Signal Internals](docs/SIGNAL_INTERNALS.md)**: Technical details about signal implementation
- **[Strongly Typed Props](docs/STRONGLY_TYPED_PROPS.md)**: TypeScript type safety for HTML elements

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
import { div, h1, p, button, input, span } from 'tacit-dom';

const element = div(
  { className: 'container' },
  h1({ children: 'Hello World' }),
  p({ children: 'This is a paragraph' }),
  button({ onClick: handleClick, children: 'Click me' }),
);
```

## 🎯 Examples

The `examples/` directory contains comprehensive examples demonstrating Tacit-DOM features:

### Available Examples

- **🎲 Random Generator** (`/random-generator`): Signal updates with automatic UI re-rendering
- **🐛 Debug** (`/debug`): Reactive signals with disabled states and real-time logging
- **🌐 Router** (`/router`): Advanced client-side routing with navigation and error handling

- **⚡ Signals** (`/signals`): Unified signal API with preserved signals and reactive updates
- **🎨 ClassNames** (`/classnames`): Dynamic CSS class management utility
- **🧩 Component Props** (`/props-demo`): Strongly-typed components with props and reactive updates
- **🚨 Error Boundary** (`/error-boundary`): Graceful error handling and recovery for components

### Example Features

Each example demonstrates different aspects of Tacit-DOM:

- **Reactive Signals**: Global state management without providers or context
- **Computed Values**: Automatic dependency tracking and derived state
- **Event Handling**: Built-in DOM event support with reactive updates
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

```

### Example Ports

Each example runs on a different port:

- **Debug**: `http://localhost:5173`
- **Random Generator**: `http://localhost:5174`
- **Router**: `http://localhost:5175`

- **Signals**: `http://localhost:5177`
- **ClassNames**: `http://localhost:5178`
- **Error Boundary**: `http://localhost:3004`

For detailed information about each example, see the [Examples README](examples/README.md).

## 📄 License

This project is licensed under the [MIT License](LICENSE).
