/**
 * @fileoverview Tacit-DOM - A clean, Preact-like DOM system
 *
 * This is a complete rewrite that works like Preact/React:
 * - Components re-render when signals change
 * - Simple component creation with automatic reactivity
 * - Clean DOM manipulation
 * - No complex instance management
 */

import { effect, signal, type Signal } from './signals-new';

// Global state for tracking component instances
const componentInstances = new Map<string, ComponentInstance>();
let nextComponentId = 1;

/**
 * Component instance that manages its own state and rendering
 */
type ComponentInstance = {
  id: string;
  element: HTMLElement;
  render: () => HTMLElement;
  cleanup: () => void;
};

/**
 * Component function type
 */
export type Component<P = {}> = (props: P) => HTMLElement;

/**
 * Creates a reactive component that automatically re-renders when signals change
 */
export function component<P = {}>(
  renderFn: (props: P) => HTMLElement,
): Component<P> {
  return (props: P) => {
    // Create a unique ID for this component call
    const componentId = `component_${nextComponentId++}`;

    // Check if we already have an instance for this component call
    let instance = componentInstances.get(componentId);

    if (!instance) {
      // Create new component instance
      const container = document.createElement('div');

      // Create the render function that will be used in effects
      const render = () => {
        const element = renderFn(props);
        return element;
      };

      // Set up effect to track dependencies and re-render
      const cleanup = effect(() => {
        const newElement = render();

        // Update the DOM
        if (container.firstChild) {
          container.replaceChild(newElement, container.firstChild);
        } else {
          container.appendChild(newElement);
        }
      });

      // Store the instance
      instance = {
        id: componentId,
        element: container,
        render,
        cleanup,
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
  // This will be implemented when we integrate with the component system
  // For now, just create a regular signal
  return signal(initialValue);
}

/**
 * Creates a div element
 */
export function div(
  props?: { className?: string; classNames?: string | string[] } | string,
  ...children: (string | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('div');

  if (typeof props === 'string') {
    element.textContent = props;
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
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
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  } else {
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
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
        onclick?: () => void;
        className?: string;
        classNames?: string | string[];
      }
    | string,
  ...children: (string | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('button');

  if (typeof props === 'string') {
    element.textContent = props;
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
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
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  } else {
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
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
  props?: { className?: string; classNames?: string | string[] } | string,
  ...children: (string | HTMLElement)[]
): HTMLElement {
  const element = document.createElement('h1');

  if (typeof props === 'string') {
    element.textContent = props;
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
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
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  } else {
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
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
export function render(component: HTMLElement, container: HTMLElement): void {
  container.innerHTML = '';
  container.appendChild(component);
}
