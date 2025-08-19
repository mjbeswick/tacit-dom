# DOM Functions Internal Architecture

## Overview

The DOM module in Tacit-DOM provides a comprehensive system for creating HTML elements with reactive properties, handling event listeners, and managing reactive subscriptions. This document explains the internal workings of how DOM elements are created, how reactivity is implemented, and how the system prevents common issues like infinite loops.

## Architecture Overview

The DOM system is built around several key concepts:

1. **Element Factory Functions** - Factory functions that create HTML elements with reactive capabilities
2. **Reactive Property System** - Automatic updates when signals or computed values change
3. **Event Handling** - React-like event handling with camelCase prop names
4. **Subscription Management** - Automatic cleanup of reactive subscriptions to prevent memory leaks
5. **Infinite Loop Prevention** - Built-in safeguards against runaway reactive updates

## Core Components

### 1. Element Factory System

The DOM module exports factory functions for all common HTML elements:

```typescript
export const div = createElementFactory('div');
export const h1 = createElementFactory('h1');
export const button = createElementFactory('button');
// ... and many more
```

Each factory function is created by the `createElementFactory` function, which returns an `ElementCreator` function:

```typescript
function createElementFactory(tagName: string): ElementCreator {
  return (
    props?: ElementProps | ElementChildren[0],
    ...children: ElementChildren
  ): HTMLElement => {
    // Implementation details...
  };
}
```

### 2. Component Instance Management

To enable signal preservation across renders, each element creation is wrapped in a component instance context:

```typescript
const elementComponentInstance = {
  tagName,
  id: Math.random().toString(36).substr(2, 9),
};

setComponentInstance(elementComponentInstance);

try {
  // Element creation logic...
} finally {
  clearComponentInstance();
}
```

This allows signals to maintain their state even when elements are recreated.

## Internal Implementation Details

### 1. Props Processing

When an element is created, the system processes props in several categories:

#### Event Handlers

Props starting with `on` are treated as event listeners:

```typescript
if (key.startsWith('on') && typeof value === 'function') {
  const eventName = getDomEventNameFromProp(key);
  element.addEventListener(eventName, value as EventListener);
}
```

The `getDomEventNameFromProp` function converts React-style camelCase event names to native DOM event names:

```typescript
function getDomEventNameFromProp(propKey: string): string {
  const lowerKey = propKey.toLowerCase();
  const specialCases: Record<string, string> = {
    ondoubleclick: 'dblclick',
  };

  return specialCases[lowerKey] || lowerKey.slice(2);
}
```

#### Reactive Attributes

For reactive values (signals or computed values), the system sets up subscriptions:

```typescript
if (isReactive(value)) {
  let isUpdating = false;

  const updateAttribute = () => {
    if (isUpdating) return;
    if (!checkUpdateLimit()) return;

    isUpdating = true;

    try {
      const attrValue = safeGetValue(value);
      // Update the attribute...
    } finally {
      isUpdating = false;
    }
  };

  // Set initial value
  const initialValue = safeGetValue(value);
  // Apply initial value...

  const unsubscribe = value.subscribe(updateAttribute);
  subscriptions.push({ signal: value, unsubscribe });
}
```

#### Special Attribute Handling

**className/classNames**: These props get special treatment with the `classNames` utility:

```typescript
if (key === 'className') {
  if (isReactive(value)) {
    const updateClassName = () => {
      const classNameValue = safeGetValue(value);
      const finalClassName =
        typeof classNameValue === 'string' ||
        typeof classNameValue === 'number' ||
        typeof classNameValue === 'boolean' ||
        Array.isArray(classNameValue) ||
        (typeof classNameValue === 'object' && classNameValue !== null)
          ? classNames(classNameValue)
          : String(classNameValue);

      if (hasValueChanged(element, 'className', finalClassName)) {
        element.className = finalClassName;
      }
    };

    // Subscribe to changes...
  } else {
    element.className = classNames(value);
  }
}
```

**Style**: Style updates use `cssText` for efficient updates:

```typescript
if (key === 'style') {
  if (isReactive(value)) {
    const updateStyle = () => {
      const styleValue = safeGetValue(value);
      const finalStyle = String(styleValue);

      if (hasValueChanged(element, 'style', finalStyle)) {
        element.style.cssText = finalStyle;
      }
    };

    // Subscribe to changes...
  } else {
    element.style.cssText = String(value);
  }
}
```

**Boolean Attributes**: Attributes like `disabled`, `checked`, `readonly` are handled specially:

```typescript
if (
  key === 'disabled' ||
  key === 'checked' ||
  key === 'readonly' ||
  key === 'required'
) {
  const newValue = Boolean(attrValue);
  const domKey = getDomAttributeName(key);

  if (hasValueChanged(element, key, newValue)) {
    if (newValue) {
      element.setAttribute(domKey, '');
    } else {
      element.removeAttribute(domKey);
    }
  }
}
```

**Input Values**: Input elements get special handling for the `value` property:

```typescript
if (key === 'value' && element instanceof HTMLInputElement) {
  const inputValue = String(safeGetValue(value));

  if (hasValueChanged(element, key, inputValue)) {
    element.value = inputValue;
  }
}
```

### 2. Children Processing

Children are processed in order, with special handling for different types:

#### Reactive Children

When a child is a signal or computed value, the system creates a persistent text node:

```typescript
if (isReactive(child)) {
  let isUpdating = false;
  let textNode: Text | null = null;

  const updateChild = () => {
    if (isUpdating) return;
    if (!checkUpdateLimit()) return;

    isUpdating = true;

    try {
      const childValue = safeGetValue(child);
      if (!textNode) {
        textNode = document.createTextNode(String(childValue));
        element.appendChild(textNode);
      } else {
        textNode.nodeValue = String(childValue);
      }
    } finally {
      isUpdating = false;
    }
  };

  // Set initial value
  const childValue = safeGetValue(child);
  textNode = document.createTextNode(String(childValue));
  element.appendChild(textNode);

  const unsubscribe = child.subscribe(updateChild);
  subscriptions.push({ signal: child, unsubscribe });
}
```

#### String Children with Reactive Markers

Strings containing Tacit-DOM reactive markers are processed specially:

```typescript
if (typeof child === 'string' && child.includes(REACTIVE_MARKER_PREFIX)) {
  element.appendChild(createReactiveInterpolatedNode(child));
}
```

The `createReactiveInterpolatedNode` function parses strings like `"Count: ${count}"` and creates reactive text nodes.

#### Regular Children

Regular strings, numbers, and HTML elements are handled normally:

```typescript
if (
  typeof child === 'string' ||
  typeof child === 'number' ||
  typeof child === 'boolean'
) {
  element.appendChild(document.createTextNode(String(child)));
} else if (child instanceof HTMLElement) {
  element.appendChild(child);
}
```

### 3. Subscription Management

All reactive subscriptions are tracked for cleanup:

```typescript
// Store subscriptions for cleanup
if (subscriptions.length > 0) {
  reactiveNodes.set(element, subscriptions);
}
```

The `reactiveNodes` Map stores all subscriptions for each element:

```typescript
const reactiveNodes = new Map<
  HTMLElement,
  Array<{
    signal: Signal<any> | Computed<any>;
    unsubscribe: () => void;
  }>
>();
```

### 4. Infinite Loop Prevention

The system includes multiple safeguards against infinite loops:

#### Update Limit Checking

```typescript
function checkUpdateLimit(): boolean {
  globalUpdateCount++;

  // Reset counter every 100ms to allow normal operation
  const now = Date.now();
  if (now - lastResetTime > 100) {
    globalUpdateCount = 0;
    lastResetTime = now;
  }

  if (globalUpdateCount > MAX_GLOBAL_UPDATES) {
    console.error(
      'ReactiveDOM: Maximum update limit exceeded, possible infinite loop detected',
    );
    return false;
  }

  return true;
}
```

#### Update State Tracking

Each reactive update function tracks its own update state:

```typescript
let isUpdating = false;

const updateFunction = () => {
  if (isUpdating) return; // Prevent re-entrant updates
  if (!checkUpdateLimit()) return;

  isUpdating = true;

  try {
    // Update logic...
  } finally {
    isUpdating = false;
  }
};
```

#### Deep Equality Checking

To prevent unnecessary updates, the system checks if values have actually changed:

```typescript
function hasValueChanged(
  element: HTMLElement,
  key: string,
  newValue: any,
): boolean {
  if (!reactiveValues.has(element)) {
    reactiveValues.set(element, new Map());
  }

  const elementValues = reactiveValues.get(element)!;
  const oldValue = elementValues.get(key);

  if (deepEqual(oldValue, newValue)) {
    return false;
  }

  elementValues.set(key, newValue);
  return true;
}
```

The `deepEqual` function performs deep equality checks for objects and arrays.

### 5. Template String Support

Tacit-DOM provides a `template` function for creating reactive template strings:

```typescript
export function template(
  strings: TemplateStringsArray,
  ...values: (Signal<any> | Computed<any> | any)[]
): HTMLElement {
  const container = document.createElement('span');

  const updateText = () => {
    let textContent = '';
    for (let i = 0; i < strings.length; i++) {
      textContent += strings[i];
      if (i < values.length) {
        const value = values[i];
        if (isReactive(value)) {
          textContent += safeGetValue(value);
        } else {
          textContent += String(value);
        }
      }
    }
    container.textContent = textContent;
  };

  // Set initial content and subscribe to changes...
}
```

### 6. Reactive List Support

The `createReactiveList` function creates lists that automatically update when the source signal changes:

```typescript
export function createReactiveList<T>(
  signal: Signal<T[]>,
  renderItem: (_item: T, _index: number) => HTMLElement,
): HTMLElement {
  const container = document.createElement('div');

  const updateList = () => {
    if (!checkUpdateLimit()) return;

    const newItems = signal.get();

    // Check if the list has actually changed
    const hasChanged = hasValueChanged(
      container,
      'items',
      JSON.stringify(newItems),
    );

    if (!hasChanged) return;

    // Clear and re-render...
  };

  // Subscribe to changes...
}
```

## Utility Functions

### 1. Class Names Utility

The `classNames` function processes various inputs to create CSS class strings:

```typescript
function classNames(
  ...inputs: (
    | string
    | number
    | boolean
    | null
    | undefined
    | { [key: string]: any }
    | any[]
  )[]
): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      classes.push(classNames(...input));
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}
```

### 2. Attribute Name Conversion

CamelCase prop names are converted to kebab-case for DOM attributes:

```typescript
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function getDomAttributeName(propName: string): string {
  const specialCases: Record<string, string> = {
    className: 'class',
    htmlFor: 'for',
  };

  return specialCases[propName] || camelToKebab(propName);
}
```

### 3. Reactive Value Detection

The system identifies reactive values using duck typing:

```typescript
function isReactive(value: any): value is Signal<any> | Computed<any> {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.get === 'function' &&
    typeof value.subscribe === 'function'
  );
}
```

## Cleanup and Memory Management

### 1. Element Cleanup

The `cleanupElement` function removes all reactive subscriptions:

```typescript
function cleanupElement(element: HTMLElement): void {
  // Clean up regular reactive nodes
  const subscriptions = reactiveNodes.get(element);

  if (subscriptions) {
    subscriptions.forEach(({ unsubscribe }) => {
      unsubscribe();
    });
    reactiveNodes.delete(element);
  }

  // Clean up reactive list nodes
  const listSubscriptions = reactiveListNodes.get(element);

  if (listSubscriptions) {
    listSubscriptions.forEach(({ unsubscribe }) => {
      unsubscribe();
    });
    reactiveListNodes.delete(element);
  }
}
```

### 2. Render Function Cleanup

The `render` function automatically cleans up existing elements:

```typescript
export function render(
  component: () => HTMLElement,
  container: HTMLElement,
): void {
  // Clean up any existing reactive subscriptions
  const existingElements = container.querySelectorAll('*');

  existingElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      cleanupElement(el);
    }
  });

  container.innerHTML = '';

  // Render new component...
}
```

## Performance Optimizations

### 1. Value Change Detection

The system only updates DOM elements when values actually change, using deep equality checking.

### 2. Batch Updates

Multiple attribute updates are batched together to minimize DOM operations.

### 3. Text Node Reuse

For reactive text children, the system reuses existing text nodes instead of creating new ones.

### 4. Subscription Deduplication

The system prevents duplicate subscriptions to the same signal for the same element.

## Error Handling

### 1. Safe Value Access

The `safeGetValue` function safely extracts values from signals:

```typescript
function safeGetValue(signal: Signal<any> | Computed<any>): any {
  try {
    return signal.get();
  } catch (error) {
    console.error('Error getting signal value:', error);
    return '[Error]';
  }
}
```

### 2. Update Error Recovery

Each update function includes try-catch blocks to prevent errors from breaking the reactive system.

### 3. Infinite Loop Detection

The system detects and prevents infinite update loops with configurable limits.

## Integration with Signals

The DOM system integrates tightly with Tacit-DOM's signal system:

1. **Automatic Subscription**: When a signal is used as a prop or child, the DOM automatically subscribes to changes
2. **Signal Preservation**: Component instances preserve signal state across renders
3. **Cleanup Integration**: The cleanup system properly removes all signal subscriptions
4. **Batch Support**: DOM updates respect the signal system's batching mechanism

## Conclusion

The DOM module in Tacit-DOM provides a robust, performant system for creating reactive HTML elements. Its architecture ensures:

- **Reliability**: Built-in safeguards against infinite loops and memory leaks
- **Performance**: Efficient updates with change detection and batching
- **Developer Experience**: React-like API with TypeScript support
- **Memory Safety**: Automatic cleanup of reactive subscriptions
- **Flexibility**: Support for various input types and reactive patterns

The system is designed to be both powerful and safe, providing developers with the tools they need to build dynamic web applications while preventing common reactive programming pitfalls.
