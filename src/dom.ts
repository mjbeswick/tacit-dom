/**
 * @fileoverview Tacit-DOM - A clean, Preact-like DOM system
 *
 * This is a complete rewrite that works like Preact/React:
 * - Components re-render when signals change
 * - Simple component creation with automatic reactivity
 * - Clean DOM manipulation
 * - No complex instance management
 */

import { classes } from './classes';
import { effect, signal, type Signal } from './signals';

// Generic event handler type for all DOM events
type EventHandler<T = Event> = (event: T) => void | boolean;

// Common element props interface
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

// Helper function to handle common element setup
function setupElement(
  element: HTMLElement,
  props: ElementProps,
  children: (string | number | HTMLElement)[],
): void {
  // Handle event listeners
  if (props.onClick) element.addEventListener('click', props.onClick);
  if (props.onDoubleClick)
    element.addEventListener('dblclick', props.onDoubleClick);
  if (props.onMouseDown)
    element.addEventListener('mousedown', props.onMouseDown);
  if (props.onMouseUp) element.addEventListener('mouseup', props.onMouseUp);
  if (props.onMouseMove)
    element.addEventListener('mousemove', props.onMouseMove);
  if (props.onMouseEnter)
    element.addEventListener('mouseenter', props.onMouseEnter);
  if (props.onMouseLeave)
    element.addEventListener('mouseleave', props.onMouseLeave);
  if (props.onMouseOver)
    element.addEventListener('mouseover', props.onMouseOver);
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
  if (props.onDragStart)
    element.addEventListener('dragstart', props.onDragStart);
  if (props.onDragEnd) element.addEventListener('dragend', props.onDragEnd);
  if (props.onDragEnter)
    element.addEventListener('dragenter', props.onDragEnter);
  if (props.onDragLeave)
    element.addEventListener('dragleave', props.onDragLeave);
  if (props.onDragOver) element.addEventListener('dragover', props.onDragOver);
  if (props.onDrop) element.addEventListener('drop', props.onDrop);
  if (props.onTouchStart)
    element.addEventListener('touchstart', props.onTouchStart);
  if (props.onTouchMove)
    element.addEventListener('touchmove', props.onTouchMove);
  if (props.onTouchEnd) element.addEventListener('touchend', props.onTouchEnd);
  if (props.onScroll) element.addEventListener('scroll', props.onScroll);
  if (props.onResize) element.addEventListener('resize', props.onResize);
  if (props.onLoad) element.addEventListener('load', props.onLoad);
  if (props.onError) element.addEventListener('error', props.onError);

  // Handle class names
  if (props.className) {
    // Deprecated: className will be removed in a future version
    element.className = props.className;
  }
  if (props.classNames) {
    // Use the classes utility for flexible class handling
    element.className = classes(props.classNames);
  }

  // Handle children
  children.forEach((child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(String(child)));
    } else {
      element.appendChild(child);
    }
  });
}

// Helper function to handle text-only elements
function setupTextElement(
  element: HTMLElement,
  textContent: string | number,
  children: (string | number | HTMLElement)[],
): void {
  element.textContent = String(textContent);
  children.forEach((child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(String(child)));
    } else {
      element.appendChild(child);
    }
  });
}

// Global state for tracking component instances
const componentInstances = new Map<string, ComponentInstance>();
let nextComponentId = 1;

// Component context for tracking the currently rendering component
let currentComponentContext: ComponentContext | null = null;

/**
 * Component context that tracks the current component being rendered
 */
type ComponentContext = {
  id: string;
  signals: Map<string, Signal<any>>;
  stateIndex: number;
};

/**
 * Component instance that manages its own state and rendering
 */
type ComponentInstance = {
  id: string;
  element: HTMLElement;
  render: () => HTMLElement;
  cleanup: () => void;
  context: ComponentContext;
};

/**
 * Component function type
 */
export type Component<P = {}> = (props?: P) => HTMLElement;

/**
 * Creates a reactive component that automatically re-renders when signals change
 */
export function component<P = {}>(
  renderFn: (props: P) => HTMLElement,
): Component<P> {
  // Create a unique ID for this component definition (not for each call)
  const componentId = `component_${nextComponentId++}`;

  return (props?: P) => {
    // Check if we already have an instance for this component definition
    let instance = componentInstances.get(componentId);

    if (!instance) {
      // Create new component instance
      const container = document.createElement('div');

      // Create component context
      const context: ComponentContext = {
        id: componentId,
        signals: new Map(),
        stateIndex: 0,
      };

      // Create the render function that will be used in effects
      const render = () => {
        // Set the current component context
        const prevContext = currentComponentContext;
        currentComponentContext = context;

        try {
          const element = renderFn(props || ({} as P));
          return element;
        } finally {
          // Restore previous context
          currentComponentContext = prevContext;
        }
      };

      // Set up effect to track dependencies and re-render
      const cleanup = effect(() => {
        // Reset the state index for this render cycle
        context.stateIndex = 0;

        const newElement = render();

        // Update the DOM
        if (container.firstChild) {
          container.replaceChild(newElement, container.firstChild);
        } else {
          container.appendChild(newElement);
        }
      });

      // Store the instance for this component definition
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

/**
 * Hook for creating component-scoped signals that persist across re-renders
 */
export function useSignal<T>(initialValue: T): Signal<T> {
  if (!currentComponentContext) {
    throw new Error('useSignal can only be called inside a component');
  }

  // Create a stable identifier for this hook call
  const hookIndex = currentComponentContext.stateIndex++;
  const signalKey = `${currentComponentContext.id}_hook_${hookIndex}`;

  // Check if we already have a signal for this hook
  if (!currentComponentContext.signals.has(signalKey)) {
    currentComponentContext.signals.set(signalKey, signal(initialValue));
  }

  return currentComponentContext.signals.get(signalKey) as Signal<T>;
}

/**
 * Creates a div element
 */
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

/**
 * Creates a button element
 */
export function button(
  props?: string | number | (ElementProps & { disabled?: boolean }),
  ...children: (string | number | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('button');

  if (typeof props === 'string' || typeof props === 'number') {
    setupTextElement(element, props, children);
  } else if (props) {
    setupElement(element, props, children);
    if (props.disabled !== undefined) {
      element.disabled = props.disabled;
    }
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an h1 element
 */
export function h1(
  props?: string | number | ElementProps,
  ...children: (string | number | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('h1');

  if (typeof props === 'string' || typeof props === 'number') {
    setupTextElement(element, props, children);
  } else if (props) {
    setupElement(element, props, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an anchor element
 */
export function a(
  props?: string | number | (ElementProps & { href?: string; target?: string }),
  ...children: (string | number | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('a');

  if (typeof props === 'string' || typeof props === 'number') {
    setupTextElement(element, props, children);
  } else if (props) {
    setupElement(element, props, children);

    // Handle anchor-specific attributes
    if (props.href) {
      element.href = props.href;
    }
    if (props.target) {
      element.target = props.target;
    }
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Renders a component into a container
 */
export function render(
  component: HTMLElement | (() => HTMLElement) | Component<any>,
  container: HTMLElement,
): void {
  container.innerHTML = '';

  if (typeof component === 'function') {
    // If it's a component function, call it to get the element
    const element = component();
    container.appendChild(element);
  } else {
    // If it's already an HTML element, append it directly
    container.appendChild(component);
  }
}

/**
 * Creates a paragraph element
 */
export function p(
  props?: string | number | ElementProps,
  ...children: (string | number | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('p');

  if (typeof props === 'string' || typeof props === 'number') {
    setupTextElement(element, props, children);
  } else if (props) {
    setupElement(element, props, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a span element
 */
export function span(
  props?: string | number | ElementProps,
  ...children: (string | number | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('span');

  if (typeof props === 'string' || typeof props === 'number') {
    setupTextElement(element, props, children);
  } else if (props) {
    setupElement(element, props, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Cleans up a component and removes it from the DOM
 */
export function cleanup(element: HTMLElement): void {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}
