# DOM Functions Internal Architecture

## Overview

The DOM module in Tacit-DOM provides a clean, Preact-like system for creating HTML elements with reactive properties, handling event listeners, and managing component lifecycle. This document explains the internal workings of how DOM elements are created, how reactivity is implemented, and how the component system automatically manages re-rendering.

## Architecture Overview

The DOM system is built around several key concepts:

1. **Element Factory Functions** - Simple factory functions that create HTML elements with reactive capabilities
2. **Component System** - React-like components that automatically re-render when signals change
3. **Hook System** - `useSignal` hook for component-scoped state management
4. **Event Handling** - React-like event handling with camelCase prop names
5. **Automatic Reactivity** - Components automatically re-render when their dependencies change
6. **Lifecycle Management** - Automatic cleanup of effects and subscriptions

## Core Components

### 1. Element Factory System

The DOM module exports factory functions for all common HTML elements:

```typescript
export function div(
  props?: string | number | ElementProps,
  ...children: (string | number | HTMLElement)[]
): HTMLElement

export function button(
  props?: string | number | ElementProps,
  ...children: (string | number | HTMLElement)[]
): HTMLElement

export function h1(
  props?: string | number | ElementProps,
  ...children: (string | number | HTMLElement)[]
): HTMLElement

// ... and many more
```

Each factory function follows the same pattern:

```typescript
export function div(
  props?: string | number | ElementProps,
  ...children: (string | number | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('div');

  if (typeof props === 'string' || typeof props === 'number') {
    setupTextElement(element, props, children);
  } else if (props) {
    setupElement(element, props, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}
```

### 2. Component System

The component system creates reactive components that automatically re-render when signals change:

```typescript
export function component<P = {}>(
  renderFn: (props: P) => HTMLElement,
): Component<P> {
  const componentId = `component_${nextComponentId++}`;

  return (props?: P) => {
    let instance = componentInstances.get(componentId);

    if (!instance) {
      const container = document.createElement('div');
      const context: ComponentContext = {
        id: componentId,
        signals: new Map(),
        stateIndex: 0,
      };

      const render = () => {
        const prevContext = currentComponentContext;
        currentComponentContext = context;

        try {
          return renderFn(props || ({} as P));
        } finally {
          currentComponentContext = prevContext;
        }
      };

      const cleanup = effect(() => {
        context.stateIndex = 0;
        const newElement = render();
        
        if (container.firstChild) {
          container.replaceChild(newElement, container.firstChild);
        } else {
          container.appendChild(newElement);
        }
      });

      instance = {
        id: componentId,
        element: container,
        render,
        cleanup,
        context,
      };

      componentInstances.set(componentId, instance);
    }

    return instance.element;
  };
}
```

### 3. Hook System

The `useSignal` hook creates component-scoped signals that persist across re-renders:

```typescript
export function useSignal<T>(initialValue: T): Signal<T> {
  if (!currentComponentContext) {
    throw new Error('useSignal can only be called inside a component');
  }

  const hookIndex = currentComponentContext.stateIndex++;
  const signalKey = `${currentComponentContext.id}_hook_${hookIndex}`;

  if (!currentComponentContext.signals.has(signalKey)) {
    currentComponentContext.signals.set(signalKey, signal(initialValue));
  }

  return currentComponentContext.signals.get(signalKey) as Signal<T>;
}
```

## Internal Implementation Details

### 1. Props Processing

When an element is created, the system processes props in several categories:

#### Event Handlers

Props starting with `on` are treated as event listeners:

```typescript
function setupElement(
  element: HTMLElement,
  props: ElementProps,
  children: (string | number | HTMLElement)[],
): void {
  // Handle event listeners
  if (props.onClick) element.addEventListener('click', props.onClick);
  if (props.onDoubleClick) element.addEventListener('dblclick', props.onDoubleClick);
  if (props.onMouseDown) element.addEventListener('mousedown', props.onMouseDown);
  if (props.onMouseUp) element.addEventListener('mouseup', props.onMouseUp);
  if (props.onMouseMove) element.addEventListener('mousemove', props.onMouseMove);
  if (props.onMouseEnter) element.addEventListener('mouseenter', props.onMouseEnter);
  if (props.onMouseLeave) element.addEventListener('mouseleave', props.onMouseLeave);
  if (props.onMouseOver) element.addEventListener('mouseover', props.onMouseOver);
  if (props.onMouseOut) element.addEventListener('mouseout', props.onMouseOut);
  if (props.onWheel) element.addEventListener('wheel', props.onWheel);
  if (props.onKeyDown) element.addEventListener('keydown', props.onKeyDown);
  if (props.onKeyUp) element.addEventListener('keyup', props.onKeyUp);
  if (props.onKeyPress) element.addEventListener('keypress', props.onKeyPress);
  if (props.onChange) element.addEventListener('change', props.onChange);
  if (props.onInput) element.addEventListener('input', props.onInput);
  if (props.onSubmit) element.addEventListener('submit', props.onSubmit);
  if (props.onFocus) element.addEventListener('focus', props.onFocus);
  if (props.onBlur) element.addEventListener('blur', props.onBlur);
  if (props.onDrag) element.addEventListener('drag', props.onDrag);
  if (props.onDragStart) element.addEventListener('dragstart', props.onDragStart);
  if (props.onDragEnd) element.addEventListener('dragend', props.onDragEnd);
  if (props.onDragEnter) element.addEventListener('dragenter', props.onDragEnter);
  if (props.onDragLeave) element.addEventListener('dragleave', props.onDragLeave);
  if (props.onDragOver) element.addEventListener('dragover', props.onDragOver);
  if (props.onDrop) element.addEventListener('drop', props.onDrop);
  if (props.onTouchStart) element.addEventListener('touchstart', props.onTouchStart);
  if (props.onTouchMove) element.addEventListener('touchmove', props.onTouchMove);
  if (props.onTouchEnd) element.addEventListener('touchend', props.onTouchEnd);
  if (props.onScroll) element.addEventListener('scroll', props.onScroll);
  if (props.onResize) element.addEventListener('resize', props.onResize);
  if (props.onLoad) element.addEventListener('load', props.onLoad);
  if (props.onError) element.addEventListener('error', props.onError);
}
```

#### Element Properties

Basic element properties are applied directly:

```typescript
// Handle className
if (props.className) {
  element.className = props.className;
}

// Handle classNames (array of classes)
if (props.classNames) {
  if (Array.isArray(props.classNames)) {
    element.className = props.classNames.join(' ');
  } else {
    element.className = props.classNames;
  }
}

// Handle disabled state
if (props.disabled !== undefined) {
  element.disabled = props.disabled;
}
```

#### Children Processing

Children are processed and appended to the element:

```typescript
function setupElement(
  element: HTMLElement,
  props: ElementProps,
  children: (string | number | HTMLElement)[],
): void {
  // ... props handling ...

  // Process children
  children.forEach((child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  });
}
```

### 2. Component Instance Management

Each component definition gets a unique instance that manages its state:

```typescript
type ComponentInstance = {
  id: string;
  element: HTMLElement;
  render: () => HTMLElement;
  cleanup: () => void;
  context: ComponentContext;
};

type ComponentContext = {
  id: string;
  signals: Map<string, Signal<any>>;
  stateIndex: number;
};
```

### 3. Effect Integration

Components use effects to automatically re-render when signals change:

```typescript
const cleanup = effect(() => {
  // Reset state index for this render cycle
  context.stateIndex = 0;

  const newElement = render();

  // Update the DOM
  if (container.firstChild) {
    container.replaceChild(newElement, container.firstChild);
  } else {
    container.appendChild(newElement);
  }
});
```

## Event Handling System

### Event Handler Types

All event handlers follow the same pattern:

```typescript
type EventHandler<T = Event> = (event: T) => void | boolean;
```

### Supported Events

The system supports comprehensive event handling:

- **Mouse Events**: `onClick`, `onDoubleClick`, `onMouseDown`, `onMouseUp`, `onMouseMove`, `onMouseEnter`, `onMouseLeave`, `onMouseOver`, `onMouseOut`, `onWheel`
- **Keyboard Events**: `onKeyDown`, `onKeyUp`, `onKeyPress`
- **Form Events**: `onChange`, `onInput`, `onSubmit`, `onFocus`, `onBlur`
- **Drag & Drop Events**: `onDrag`, `onDragStart`, `onDragEnd`, `onDragEnter`, `onDragLeave`, `onDragOver`, `onDrop`
- **Touch Events**: `onTouchStart`, `onTouchMove`, `onTouchEnd`
- **Other Events**: `onScroll`, `onResize`, `onLoad`, `onError`

### Event Name Conversion

Event names are converted from React-style camelCase to native DOM event names:

```typescript
// React-style: onClick -> DOM: click
// React-style: onDoubleClick -> DOM: dblclick
// React-style: onKeyDown -> DOM: keydown
```

## Component Lifecycle

### 1. Component Creation

```typescript
const Counter = component(() => {
  const count = useSignal(0);
  return div(`Count: ${count.get()}`);
});
```

### 2. Component Rendering

When a component is called, it either:
- Creates a new instance if none exists
- Returns the existing instance's element

### 3. Component Updates

Components automatically re-render when:
- Signals used in the component change
- Props change (for components with props)
- Parent components re-render

### 4. Component Cleanup

Effects automatically clean up when components unmount:

```typescript
const cleanup = effect(() => {
  const interval = setInterval(() => {
    count.set(count.get() + 1);
  }, 1000);
  
  return () => clearInterval(interval);
});
```

## Performance Optimizations

### 1. Component Instance Reuse

Components reuse instances across renders to avoid unnecessary DOM recreation:

```typescript
let instance = componentInstances.get(componentId);

if (!instance) {
  // Create new instance
} else {
  // Reuse existing instance
}
```

### 2. Effect Batching

Effects automatically batch updates to prevent unnecessary re-renders:

```typescript
// Multiple signal updates in one effect cycle
batch(() => {
  firstName.set('Jane');
  lastName.set('Smith');
  email.set('jane@example.com');
});
```

### 3. Signal Dependency Tracking

Effects automatically track only the signals they actually use:

```typescript
effect(() => {
  // Only tracks count, not other signals
  console.log('Count changed to:', count.get());
});
```

## Memory Management

### 1. Automatic Cleanup

Effects automatically clean up when components unmount:

```typescript
effect(() => {
  const subscription = someSignal.subscribe(callback);
  
  return () => {
    subscription(); // Cleanup function
  };
});
```

### 2. Component Instance Cleanup

Component instances are cleaned up when no longer referenced:

```typescript
const cleanup = effect(() => {
  // ... effect logic ...
});

// Cleanup is called when component unmounts
instance.cleanup = cleanup;
```

## Error Handling

### 1. Component Error Boundaries

Components can be wrapped in error boundaries for graceful error handling:

```typescript
const SafeComponent = errorBoundary(component(() => {
  // Component that might throw
  if (Math.random() > 0.5) {
    throw new Error('Random error');
  }
  return div('Success!');
}), {
  fallback: (error) => div(`Error: ${error.message}`),
});
```

### 2. Signal Error Handling

Signals handle errors gracefully during updates:

```typescript
const update = async (fn: (prev: T) => T | Promise<T>): Promise<void> => {
  try {
    // ... update logic ...
  } catch (error) {
    console.warn('Signal update failed:', error);
  }
};
```

## Type Safety

### 1. Element Props

All element props are strongly typed:

```typescript
type ElementProps = {
  className?: string;
  classNames?: string | string[];
  onClick?: EventHandler;
  onKeyDown?: EventHandler<KeyboardEvent>;
  onChange?: EventHandler;
  disabled?: boolean;
  // ... and many more
};
```

### 2. Component Types

Components are typed with their props:

```typescript
type Component<P = {}> = (props?: P) => HTMLElement;

const Greeting = component<{ name: string }>((props) => {
  return div(`Hello, ${props.name}!`);
});
```

### 3. Hook Types

Hooks are typed with their return values:

```typescript
const count: Signal<number> = useSignal(0);
const name: Signal<string> = useSignal('');
const items: Signal<string[]> = useSignal([]);
```

## Best Practices

### 1. Component Structure

```typescript
const UserProfile = component<{ userId: string }>((props) => {
  const user = useSignal(null);
  const isLoading = useSignal(false);
  
  // Effects for side effects
  effect(() => {
    if (props.userId) {
      loadUser(props.userId);
    }
  });
  
  // Computed values for derived state
  const displayName = computed(() => 
    user.get() ? user.get().name : 'Loading...'
  );
  
  return div(
    isLoading.get() ? div('Loading...') : div(`Name: ${displayName.get()}`)
  );
});
```

### 2. Signal Management

```typescript
// ✅ Good - use useSignal for component state
const Counter = component(() => {
  const count = useSignal(0);
  return div(`Count: ${count.get()}`);
});

// ❌ Bad - don't create signals in render
const Counter = component(() => {
  const count = signal(0); // Recreated on every render
  return div(`Count: ${count.get()}`);
});
```

### 3. Effect Usage

```typescript
// ✅ Good - return cleanup function
effect(() => {
  const interval = setInterval(() => {
    count.set(count.get() + 1);
  }, 1000);
  
  return () => clearInterval(interval);
});

// ✅ Good - use for component lifecycle
effect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounting');
});
```

## Summary

The new DOM system in Tacit-DOM provides:

- **Simple Element Creation**: Direct factory functions for all HTML elements
- **Automatic Reactivity**: Components automatically re-render when signals change
- **Component Lifecycle**: Automatic cleanup and memory management
- **Type Safety**: Full TypeScript support for all props and events
- **Performance**: Optimized rendering with effect batching and instance reuse
- **Developer Experience**: React-like syntax that's familiar and intuitive

This makes building reactive web applications much simpler and more performant than the previous system.
