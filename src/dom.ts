/**
 * @fileoverview Tacit-DOM - A clean, Preact-like DOM system
 *
 * This is a complete rewrite that works like Preact/React:
 * - Components re-render when signals change
 * - Simple component creation with automatic reactivity
 * - Clean DOM manipulation
 * - No complex instance management
 */

import { effect, signal, type Signal } from './signals';

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
  props?:
    | { className?: string; classNames?: string | string[] }
    | string
    | number,
  ...children: (string | number | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('div');

  if (typeof props === 'string' || typeof props === 'number') {
    element.textContent = String(props);
    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  } else if (props) {
    if (props.className) {
      element.className = props.className;
    }
    if (props.classNames) {
      if (Array.isArray(props.classNames)) {
        element.className = props.classNames.join(' ');
      } else {
        element.className = props.classNames;
      }
    }

    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  } else {
    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * Creates a button element
 */
export function button(
  props?:
    | {
        onclick?: (event: Event) => void;
        className?: string;
        classNames?: string | string[];
      }
    | string
    | number,
  ...children: (string | number | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('button');

  if (typeof props === 'string' || typeof props === 'number') {
    element.textContent = String(props);
    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  } else if (props) {
    if (props.onclick) {
      element.addEventListener('click', props.onclick);
    }
    if (props.className) {
      element.className = props.className;
    }
    if (props.classNames) {
      if (Array.isArray(props.classNames)) {
        element.className = props.classNames.join(' ');
      } else {
        element.className = props.classNames;
      }
    }

    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  } else {
    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * Creates an h1 element
 */
export function h1(
  props?:
    | { className?: string; classNames?: string | string[] }
    | string
    | number,
  ...children: (string | number | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('h1');

  if (typeof props === 'string' || typeof props === 'number') {
    element.textContent = String(props);
    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  } else if (props) {
    if (props.className) {
      element.className = props.className;
    }
    if (props.classNames) {
      if (Array.isArray(props.classNames)) {
        element.className = props.classNames.join(' ');
      } else {
        element.className = props.classNames;
      }
    }

    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  } else {
    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * Creates an anchor element
 */
export function a(
  props?:
    | {
        href?: string;
        target?: string;
        className?: string;
        classNames?: string | string[];
        onclick?: (event: Event) => void;
      }
    | string
    | number,
  ...children: (string | number | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('a');

  if (typeof props === 'string' || typeof props === 'number') {
    element.textContent = String(props);
    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  } else if (props) {
    if (props.href) {
      element.href = props.href;
    }
    if (props.target) {
      element.target = props.target;
    }
    if (props.onclick) {
      element.addEventListener('click', props.onclick);
    }
    if (props.className) {
      element.className = props.className;
    }
    if (props.classNames) {
      if (Array.isArray(props.classNames)) {
        element.className = props.classNames.join(' ');
      } else {
        element.className = props.classNames;
      }
    }

    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
  } else {
    children.forEach((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else {
        element.appendChild(child);
      }
    });
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
 * Cleans up a component and removes it from the DOM
 */
export function cleanup(element: HTMLElement): void {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}
