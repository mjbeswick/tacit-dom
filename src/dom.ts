/**
 * @fileoverview Tacit-DOM - A clean, Preact-like DOM system
 *
 * This is a complete rewrite that works like Preact/React:
 * - Components re-render when signals change
 * - Simple component creation with automatic reactivity
 * - Clean DOM manipulation
 * - No complex instance management
 */

import { className } from './classes';
import { computed, effect, signal, type ReadonlySignal, type Signal } from './signals';

/**
 * Generic event handler type for all DOM events.
 *
 * Event handlers can return `false` to prevent default behavior,
 * or `void` for normal event handling.
 *
 * @template T - The type of event (defaults to Event)
 * @param event - The DOM event object
 * @returns `false` to prevent default behavior, or `void` for normal handling
 *
 * @example
 * ```typescript
 * // Basic click handler
 * const handleClick = (event: Event) => {
 *   console.log('Button clicked!');
 * };
 *
 * // Prevent default behavior
 * const handleSubmit = (event: Event) => {
 *   if (!isValid()) {
 *     return false; // Prevents form submission
 *   }
 * };
 *
 * // With specific event types
 * const handleKeyDown = (event: KeyboardEvent) => {
 *   if (event.key === 'Enter') {
 *     submitForm();
 *   }
 * };
 * ```
 */
type EventHandler<T = Event> = (event: T) => void | boolean;

/**
 * Type for valid DOM element children.
 *
 * Falsy values (null, undefined, false, '') are automatically filtered out
 * and not rendered, allowing for conditional rendering patterns.
 * Numbers (including 0) are rendered as text content.
 */
export type ElementChildren = (string | number | HTMLElement | null | undefined | false | 0 | '')[];

/**
 * Common element properties that can be applied to any DOM element.
 *
 * This interface provides a comprehensive set of event handlers and styling
 * options that work consistently across all element types.
 *
 * @example
 * ```typescript
 * // Basic element with props
 * const button = div(
 *   {
 *     classNames: 'btn btn-primary',
 *     onClick: () => console.log('Clicked!'),
 *     style: 'background-color: blue; color: white;'
 *   },
 *   'Click me'
 * );
 *
 * // Element with multiple event handlers
 * const input = div(
 *   {
 *     onFocus: () => console.log('Input focused'),
 *     onBlur: () => console.log('Input blurred'),
 *     onChange: (e) => console.log('Value changed:', e.target.value),
 *     classNames: ['form-control', { 'has-error': hasError }]
 *   },
 *   'Input content'
 * );
 *
 * // Element with conditional classes
 * const message = div(
 *   {
 *     classNames: {
 *       'message': true,
 *       'message--success': isSuccess,
 *       'message--error': isError,
 *       'message--warning': isWarning
 *     }
 *   },
 *   'Status message'
 * );
 * ```
 */
export type ElementProps = {
  /**
   * Flexible CSS class names prop that accepts strings, arrays, objects, and more.
   * This is the recommended way to handle CSS classes.
   */
  className?: string | string[] | { [key: string]: any } | (string | { [key: string]: any })[];
  /**
   * CSS styles that can be applied to the element.
   * Accepts either a string of CSS rules or a React-like style object.
   * Can also be reactive when using signals or computed values.
   */
  style?:
    | string
    | { [key: string]: string | number | Signal<string | number> | ReadonlySignal<string | number> }
    | Signal<string | { [key: string]: string | number | Signal<string | number> | ReadonlySignal<string | number> }>
    | ReadonlySignal<
        string | { [key: string]: string | number | Signal<string | number> | ReadonlySignal<string | number> }
      >;
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
function setupElement(element: HTMLElement, props: ElementProps, children: ElementChildren): void {
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

  // Handle class names
  if (props.className) {
    // Use the className utility for flexible class handling
    element.className = className(props.className);
  }

  // Handle styles
  if (props.style) {
    if (typeof props.style === 'string') {
      element.style.cssText = props.style;
    } else if (typeof props.style === 'object' && !('get' in props.style)) {
      // Handle static style object (may contain signals as values)
      const applyStyles = (styleObj: {
        [key: string]: string | number | Signal<string | number> | ReadonlySignal<string | number>;
      }) => {
        Object.entries(styleObj).forEach(([property, value]) => {
          if (typeof value === 'string' || typeof value === 'number') {
            // Convert camelCase to kebab-case and handle units
            const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
            const cssValue = typeof value === 'number' ? `${value}px` : String(value);
            element.style.setProperty(cssProperty, cssValue);
          } else if (
            typeof value === 'object' &&
            value !== null &&
            'get' in value &&
            typeof value.get === 'function' &&
            'subscribe' in value &&
            typeof value.subscribe === 'function'
          ) {
            // Handle signal/computed value
            const updateProperty = () => {
              const signalValue = value.get();
              const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
              const cssValue = typeof signalValue === 'number' ? `${signalValue}px` : String(signalValue);
              element.style.setProperty(cssProperty, cssValue);
            };
            updateProperty();
            value.subscribe(updateProperty);
          }
        });
      };

      applyStyles(props.style);
    } else {
      // Handle reactive styles (Signal or Computed)
      const updateStyle = () => {
        const styleValue = (
          props.style as
            | Signal<string | { [key: string]: string | number }>
            | ReadonlySignal<string | { [key: string]: string | number }>
        ).get();
        if (typeof styleValue === 'string') {
          element.style.cssText = styleValue;
        } else if (typeof styleValue === 'object') {
          // Clear existing styles first
          element.style.cssText = '';
          // Apply new styles
          Object.entries(styleValue).forEach(([property, value]) => {
            // Convert camelCase to kebab-case and handle units
            const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
            const cssValue = typeof value === 'number' ? `${value}px` : String(value);
            element.style.setProperty(cssProperty, cssValue);
          });
        }
      };

      // Set initial style
      updateStyle();

      // Subscribe to changes
      (
        props.style as
          | Signal<string | { [key: string]: string | number }>
          | ReadonlySignal<string | { [key: string]: string | number }>
      ).subscribe(updateStyle);
    }
  }

  // Handle children - filter out falsy values and handle reactive children
  children.forEach((child) => {
    if (child !== null && child !== undefined && child !== false && child !== '') {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else if (
        typeof child === 'object' &&
        child !== null &&
        !Array.isArray(child) &&
        typeof child !== 'function' &&
        'get' in child &&
        typeof child.get === 'function' &&
        'subscribe' in child &&
        typeof child.subscribe === 'function' &&
        !(child instanceof HTMLElement) // Don't treat HTMLElements as reactive values
      ) {
        // Handle reactive children (signals or computed values)
        const reactiveChild = child as any; // Type assertion to avoid value property requirement
        const createReactiveTextNode = () => {
          const value = reactiveChild.get();
          const textNode = document.createTextNode(String(value));
          element.appendChild(textNode);

          // Subscribe to changes and update the text node
          reactiveChild.subscribe(() => {
            textNode.textContent = String(reactiveChild.get());
          });
        };

        createReactiveTextNode();
      } else {
        element.appendChild(child);
      }
    }
  });
}

// Helper function to handle text-only elements
function setupTextElement(element: HTMLElement, textContent: string | number, children: ElementChildren): void {
  element.textContent = String(textContent);
  children.forEach((child) => {
    if (child !== null && child !== undefined && child !== false && child !== '') {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else if (
        typeof child === 'object' &&
        child !== null &&
        !Array.isArray(child) &&
        typeof child !== 'function' &&
        'get' in child &&
        typeof child.get === 'function' &&
        'subscribe' in child &&
        typeof child.subscribe === 'function' &&
        !(child instanceof HTMLElement) // Don't treat HTMLElements as reactive values
      ) {
        // Handle reactive children (signals or computed values)
        const reactiveChild = child as any; // Type assertion to avoid value property requirement
        const createReactiveTextNode = () => {
          const value = reactiveChild.get();
          const textNode = document.createTextNode(String(value));
          element.appendChild(textNode);

          // Subscribe to changes and update the text node
          reactiveChild.subscribe(() => {
            textNode.textContent = String(reactiveChild.get());
          });
        };

        createReactiveTextNode();
      } else {
        element.appendChild(child);
      }
    }
  });
}

// Global state for tracking component instances
const componentInstances = new Map<string, ComponentInstance>();
let nextComponentId = 1;

// Component context for tracking the currently rendering component
let currentComponentContext: ComponentContext | null = null;

/**
 * Component context that tracks the current component being rendered.
 *
 * This is an internal type used by the component system to manage
 * component state and signal tracking.
 *
 * @internal
 */
type ComponentContext = {
  /** Unique identifier for the component */
  id: string;
  /** Map of signal keys to signal instances for this component */
  signals: Map<string, Signal<any>>;
  /** Current state index for tracking signal creation order */
  stateIndex: number;
};

/**
 * Component instance that manages its own state and rendering.
 *
 * This is an internal type used by the component system to manage
 * component lifecycle and rendering.
 *
 * @internal
 */
type ComponentInstance = {
  /** Unique identifier for the component instance */
  id: string;
  /** The DOM element that contains the component */
  element: HTMLElement;
  /** Function to render the component */
  render: () => HTMLElement;
  /** Function to clean up the component and its subscriptions */
  cleanup: () => void;
  /** Component context for managing state */
  context: ComponentContext;
};

/**
 * Component function type that represents a reactive component.
 *
 * Components are functions that return DOM elements and automatically
 * re-render when their signals change.
 *
 * @template P - The type of props the component accepts
 * @param props - Optional props object passed to the component
 * @returns A DOM element representing the rendered component
 *
 * @example
 * ```typescript
 * // Component that accepts props
 * const Greeting = component((props: { name: string }, utils) => {
 *   const count = utils.signal(0);
 *
 *   return div(
 *     { classNames: 'greeting' },
 *     h1(`Hello, ${props.name}!`),
 *     p(`You've been greeted ${count.get()} times`),
 *     button(
 *       { onClick: () => count.set(count.get() + 1) },
 *       'Greet again'
 *     )
 *   );
 * });
 *
 * // Usage
 * const greetingElement = Greeting({ name: 'World' });
 * document.body.appendChild(greetingElement);
 * ```
 */
export type Component<P = {}> = (props?: P) => HTMLElement;

/**
 * Component utilities object passed to render functions.
 *
 * This object provides access to reactive primitives (signal, computed, effect)
 * that are scoped to the component and automatically cleaned up when the
 * component is unmounted.
 *
 * @example
 * ```typescript
 * const Counter = component((props, utils) => {
 *   // Create component-scoped signals
 *   const count = utils.signal(0);
 *   const doubled = utils.computed(() => count.get() * 2);
 *
 *   // Create component-scoped effects
 *   utils.effect(() => {
 *     console.log(`Count changed to: ${count.get()}`);
 *   });
 *
 *   return div(
 *     button({ onClick: () => count.set(count.get() + 1) }, 'Increment'),
 *     p(`Count: ${count.get()}`),
 *     p(`Doubled: ${doubled.get()}`)
 *   );
 * });
 * ```
 */
export type ComponentUtils = {
  /** Creates a component-scoped signal */
  signal: <T>(initialValue: T) => Signal<T>;
  /** Creates a component-scoped computed value */
  computed: <T>(computeFn: () => T) => ReadonlySignal<T>;
  /** Creates a component-scoped effect */
  effect: (fn: () => void | (() => void), options?: { allowRecursion?: boolean }) => void;
};

/**
 * Creates a reactive component that automatically re-renders when signals change.
 *
 * Components are the building blocks of reactive UIs. They automatically track
 * which signals they depend on and re-render whenever those signals change.
 *
 * Each component instance maintains its own state and signals, ensuring that
 * multiple instances of the same component don't interfere with each other.
 *
 * @template P - The type of props the component accepts
 * @param renderFn - A function that renders the component and receives props and utilities
 * @returns A component function that can be called with props to render instances
 *
 * @example
 * ```typescript
 * // Simple counter component
 * const Counter = component((props: { initialValue?: number }, utils) => {
 *   const count = utils.signal(props.initialValue || 0);
 *
 *   const increment = () => count.set(count.get() + 1);
 *   const decrement = () => count.set(count.get() - 1);
 *   const reset = () => count.set(props.initialValue || 0);
 *
 *   return div(
 *     { classNames: 'counter' },
 *     h1(`Count: ${count.get()}`),
 *     div(
 *       { classNames: 'controls' },
 *       button({ onClick: decrement }, '-'),
 *       button({ onClick: reset }, 'Reset'),
 *       button({ onClick: increment }, '+')
 *     )
 *   );
 * });
 *
 * // Usage with different initial values
 * const counter1 = Counter({ initialValue: 10 });
 * const counter2 = Counter({ initialValue: 0 });
 *
 * // Components automatically re-render when signals change
 * // Each instance maintains its own state
 * ```
 *
 * @example
 * ```typescript
 * // Component with computed values and effects
 * const TodoList = component((props, utils) => {
 *   const todos = utils.signal<string[]>([]);
 *   const newTodo = utils.signal('');
 *
 *   // Computed value for filtered todos
 *   const activeTodos = utils.computed(() =>
 *     todos.get().filter(todo => !todo.startsWith('✓ '))
 *   );
 *
 *   // Effect for logging changes
 *   utils.effect(() => {
 *     console.log(`Active todos: ${activeTodos.get().length}`);
 *   });
 *
 *   const addTodo = () => {
 *     if (newTodo.get().trim()) {
 *       todos.update(prev => [...prev, newTodo.get().trim()]);
 *       newTodo.set('');
 *     }
 *   };
 *
 *   const toggleTodo = (index: number) => {
 *     todos.update(prev =>
 *       prev.map((todo, i) =>
 *         i === index
 *           ? (todo.startsWith('✓ ') ? todo.slice(2) : `✓ ${todo}`)
 *           : todo
 *       )
 *     );
 *   };
 *
 *   return div(
 *     { classNames: 'todo-list' },
 *     h1('Todo List'),
 *     div(
 *       { classNames: 'add-todo' },
 *       input({
 *         value: newTodo.get(),
 *         onInput: (e) => newTodo.set(e.target.value),
 *         onKeyDown: (e) => e.key === 'Enter' && addTodo()
 *       }),
 *       button({ onClick: addTodo }, 'Add')
 *     ),
 *     div(
 *       { classNames: 'todos' },
 *       ...todos.get().map((todo, index) =>
 *         div(
 *           {
 *             classNames: ['todo', { 'completed': todo.startsWith('✓ ') }],
 *             onClick: () => toggleTodo(index)
 *           },
 *           todo
 *         )
 *       )
 *     )
 *   );
 * });
 * ```
 */
/**
 * Post-render callback type for component lifecycle hooks.
 * Called after each render with the rendered element.
 * Can return a cleanup function that will be called before the next render or on unmount.
 */
export type PostRenderCallback = (element: HTMLElement) => (() => void) | void;

export function component<P = {}>(
  renderFn: (props: P, utils: ComponentUtils) => HTMLElement,
  postRender?: PostRenderCallback,
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

      // Create utils object with signal function
      const utils: ComponentUtils = {
        signal: <T>(initialValue: T): Signal<T> => {
          if (!currentComponentContext) {
            throw new Error('signal can only be called inside a component');
          }

          // Create a stable identifier for this signal call
          const signalIndex = currentComponentContext.stateIndex++;
          const signalKey = `${currentComponentContext.id}_signal_${signalIndex}`;

          // Check if we already have a signal for this call
          if (!currentComponentContext.signals.has(signalKey)) {
            currentComponentContext.signals.set(signalKey, signal(initialValue));
          }

          return currentComponentContext.signals.get(signalKey) as Signal<T>;
        },
        computed: <T>(computeFn: () => T): ReadonlySignal<T> => {
          if (!currentComponentContext) {
            throw new Error('computed can only be called inside a component');
          }

          // Create a stable identifier for this computed call
          const computedIndex = currentComponentContext.stateIndex++;
          const computedKey = `${currentComponentContext.id}_computed_${computedIndex}`;

          // Check if we already have a computed for this call
          if (!currentComponentContext.signals.has(computedKey)) {
            const computedValue = computed(computeFn);
            // Store the computed value in the signals map for consistency
            currentComponentContext.signals.set(computedKey, computedValue as any);
          }

          return currentComponentContext.signals.get(computedKey) as ReadonlySignal<T>;
        },
        effect: (fn: () => void | (() => void)): void => {
          if (!currentComponentContext) {
            throw new Error('effect can only be called inside a component');
          }

          // Create a stable identifier for this effect call
          const effectIndex = currentComponentContext.stateIndex++;
          const effectKey = `${currentComponentContext.id}_effect_${effectIndex}`;

          // Run the effect and store the cleanup function if returned
          const cleanup = effect(fn);

          // Store the cleanup function in the signals map for later cleanup
          currentComponentContext.signals.set(effectKey, cleanup as any);
        },
      };

      // Create the render function that will be used in effects
      const render = () => {
        // Set the current component context
        const prevContext = currentComponentContext;
        currentComponentContext = context;

        try {
          const element = renderFn(props || ({} as P), utils);
          return element;
        } finally {
          // Restore previous context
          currentComponentContext = prevContext;
        }
      };

      // Set up effect to track dependencies and re-render
      let postRenderCleanup: (() => void) | undefined;

      const cleanup = effect(() => {
        // Call previous post-render cleanup if it exists
        if (postRenderCleanup) {
          postRenderCleanup();
          postRenderCleanup = undefined;
        }

        // Reset the state index for this render cycle
        context.stateIndex = 0;

        // The render function will be called within this effect context,
        // so any signal accesses during rendering will automatically
        // be tracked as dependencies of this effect
        const newElement = render();

        // Update the DOM
        if (container.firstChild) {
          container.replaceChild(newElement, container.firstChild);
        } else {
          container.appendChild(newElement);
        }

        // Call post-render callback if provided
        if (postRender) {
          postRenderCleanup = postRender(newElement) || undefined;
        }
      });

      // Store the instance for this component definition
      instance = {
        id: componentId,
        element: container,
        render,
        cleanup: () => {
          // Clean up post-render callback
          if (postRenderCleanup) {
            postRenderCleanup();
            postRenderCleanup = undefined;
          }
          // Clean up the effect
          cleanup();
        },
        context,
      };

      componentInstances.set(componentId, instance);
    }

    return instance.element;
  };
}

/**
 * Creates a div element.
 *
 * This is the most commonly used element creation function. It creates a div
 * element with optional props and children. The props can be passed as the
 * first argument, followed by any number of children.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A div element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple div with text
 * const element = div('Hello World');
 *
 * // Div with props and text
 * const element = div({ classNames: 'container' }, 'Hello World');
 *
 * // Div with multiple children
 * const element = div(
 *   { classNames: 'card' },
 *   h1('Title'),
 *   p('Description'),
 *   button({ onClick: () => console.log('clicked') }, 'Click me')
 * );
 *
 * // Div with conditional classes
 * const isActive = signal(true);
 * const element = div(
 *   {
 *     classNames: ['base-class', { 'active': isActive.get() }],
 *     onClick: () => console.log('div clicked')
 *   },
 *   'Clickable content'
 * );
 *
 * // Div with reactive content
 * const count = signal(0);
 * const element = div(
 *   { classNames: 'counter' },
 *   span(`Count: ${count.get()}`),
 *   button({ onClick: () => count.set(count.get() + 1) }, 'Increment')
 * );
 * ```
 */
export function div(...children: ElementChildren): HTMLElement;
export function div(props: ElementProps, ...children: ElementChildren): HTMLElement;
export function div(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLElement {
  const element = document.createElement('div');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else if (propsOrChild) {
    // If propsOrChild is an HTMLElement or other non-props object, treat it as first child
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a button element.
 *
 * Creates a button element with optional props and children. Buttons support
 * all standard element props plus a `disabled` property for controlling
 * the button's enabled state.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps with button-specific props)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A button element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple button with text
 * const element = button('Click me');
 *
 * // Button with props and text
 * const element = button({ classNames: 'btn btn-primary' }, 'Submit');
 *
 * // Button with event handler
 * const element = button(
 *   {
 *     onClick: () => console.log('Button clicked'),
 *     classNames: 'btn'
 *   },
 *   'Click me'
 * );
 *
 * // Disabled button
 * const element = button(
 *   {
 *     disabled: true,
 *     classNames: 'btn btn-disabled'
 *   },
 *   'Cannot click'
 * );
 *
 * // Button with reactive disabled state
 * const isLoading = signal(false);
 * const element = button(
 *   {
 *     disabled: isLoading.get(),
 *     classNames: ['btn', { 'loading': isLoading.get() }],
 *     onClick: () => {
 *       isLoading.set(true);
 *       // Simulate async operation
 *       setTimeout(() => isLoading.set(false), 1000);
 *     }
 *   },
 *   isLoading.get() ? 'Loading...' : 'Submit'
 * );
 *
 * // Button with icon and text
 * const element = button(
 *   { classNames: 'btn btn-icon' },
 *   span({ classNames: 'icon' }, '★'),
 *   span('Favorite')
 * );
 * ```
 */
export function button(
  props?: string | number | (ElementProps & { disabled?: boolean }),
  ...children: ElementChildren
): HTMLButtonElement {
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
 * Creates an h1 element.
 *
 * Creates a heading element with optional props and children. H1 elements
 * are typically used for the main title of a page or section.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An h1 element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple h1 with text
 * const element = h1('Page Title');
 *
 * // H1 with props and text
 * const element = h1({ classNames: 'main-title' }, 'Welcome');
 *
 * // H1 with event handler
 * const element = h1(
 *   {
 *     onClick: () => console.log('Title clicked'),
 *     classNames: 'clickable-title'
 *   },
 *   'Clickable Title'
 * );
 *
 * // H1 with reactive content
 * const userName = signal('John');
 * const element = h1(
 *   { classNames: 'user-greeting' },
 *   `Hello, ${userName.get()}!`
 * );
 *
 * // H1 with icon and text
 * const element = h1(
 *   { classNames: 'title-with-icon' },
 *   span({ classNames: 'icon' }, '👋'),
 *   span('Welcome')
 * );
 *
 * // H1 with conditional styling
 * const isImportant = signal(true);
 * const element = h1(
 *   {
 *     classNames: ['title', { 'important': isImportant.get() }],
 *     style: isImportant.get() ? 'color: red;' : ''
 *   },
 *   'Important Title'
 * );
 * ```
 */
export function h1(...children: ElementChildren): HTMLHeadingElement;
export function h1(props: ElementProps, ...children: ElementChildren): HTMLHeadingElement;
export function h1(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLHeadingElement {
  const element = document.createElement('h1');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an h2 element.
 *
 * This function creates an h2 heading element with optional props and children.
 * The props can be passed as the first argument, followed by any number of children.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An h2 element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple h2 with text
 * const element = h2('Section Title');
 *
 * // H2 with props and text
 * const element = h2({ classNames: 'section-header' }, 'Section Title');
 *
 * // H2 with multiple children
 * const element = h2(
 *   { classNames: 'page-title' },
 *   'Welcome to ',
 *   span({ classNames: 'highlight' }, 'Our App')
 * );
 * ```
 */
export function h2(...children: ElementChildren): HTMLHeadingElement;
export function h2(props: ElementProps, ...children: ElementChildren): HTMLHeadingElement;
export function h2(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLHeadingElement {
  const element = document.createElement('h2');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an h3 element.
 *
 * This function creates an h3 heading element with optional props and children.
 * The props can be passed as the first argument, followed by any number of children.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An h3 element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple h3 with text
 * const element = h3('Subsection Title');
 *
 * // H3 with props and text
 * const element = h3({ classNames: 'subsection-header' }, 'Subsection Title');
 *
 * // H3 with multiple children
 * const element = h3(
 *   { classNames: 'card-title' },
 *   'Card ',
 *   span({ classNames: 'number' }, '1')
 * );
 * ```
 */
export function h3(...children: ElementChildren): HTMLHeadingElement;
export function h3(props: ElementProps, ...children: ElementChildren): HTMLHeadingElement;
export function h3(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLHeadingElement {
  const element = document.createElement('h3');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an input element.
 *
 * This function creates an input element with optional props and children.
 * The props can be passed as the first argument, followed by any number of children.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps with input-specific props)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An input element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple text input
 * const element = input({ placeholder: 'Enter text' });
 *
 * // Input with type and value
 * const element = input({
 *   type: 'email',
 *   placeholder: 'Enter email',
 *   value: email.get(),
 *   onInput: (e) => email.set(e.target.value)
 * });
 *
 * // Input with validation
 * const element = input({
 *   type: 'password',
 *   required: true,
 *   minLength: 8,
 *   classNames: ['form-control', { 'has-error': hasError }]
 * });
 * ```
 */
export function input(
  props?: ElementProps & {
    type?: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    size?: number;
    accept?: string;
    multiple?: boolean;
    step?: number;
    min?: number;
    max?: number;
  },
  ...children: ElementChildren
): HTMLInputElement {
  const element = document.createElement('input');

  if (props) {
    // Handle input-specific attributes
    if (props.type) element.setAttribute('type', props.type);
    if (props.value !== undefined) element.setAttribute('value', props.value);
    if (props.placeholder) element.setAttribute('placeholder', props.placeholder);
    if (props.required !== undefined) element.required = props.required;
    if (props.disabled !== undefined) element.disabled = props.disabled;
    if (props.readonly !== undefined) element.readOnly = props.readonly;
    if (props.maxLength !== undefined) element.setAttribute('maxlength', props.maxLength.toString());
    if (props.minLength !== undefined) element.setAttribute('minlength', props.minLength.toString());
    if (props.pattern) element.setAttribute('pattern', props.pattern);
    if (props.size !== undefined) element.setAttribute('size', props.size.toString());
    if (props.accept) element.setAttribute('accept', props.accept);
    if (props.multiple !== undefined) element.multiple = props.multiple;
    if (props.step !== undefined) element.setAttribute('step', props.step.toString());
    if (props.min !== undefined) element.setAttribute('min', props.min.toString());
    if (props.max !== undefined) element.setAttribute('max', props.max.toString());

    // Set up common element properties
    setupElement(element, props, children);
  } else {
    // If no props, just add the children - filter out falsy values
    children.forEach((child) => {
      if (child !== null && child !== undefined && child !== false && child !== 0 && child !== '') {
        if (typeof child === 'string' || typeof child === 'number') {
          element.appendChild(document.createTextNode(String(child)));
        } else {
          element.appendChild(child);
        }
      }
    });
  }

  return element;
}

/**
 * Creates a label element.
 *
 * This function creates a label element with optional props and children.
 * The props can be passed as the first argument, followed by any number of children.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps with label-specific props)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A label element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple label
 * const element = label('Username:');
 *
 * // Label with for attribute
 * const element = label({ for: 'username-input' }, 'Username:');
 *
 * // Label with styling
 * const element = label(
 *   { classNames: 'form-label', for: 'email-input' },
 *   'Email Address:'
 * );
 * ```
 */
export function label(
  props?: string | number | (ElementProps & { for?: string }),
  ...children: ElementChildren
): HTMLLabelElement {
  const element = document.createElement('label');

  if (typeof props === 'string' || typeof props === 'number') {
    setupTextElement(element, props, children);
  } else if (props) {
    // Handle label-specific attributes
    if (props.for) element.setAttribute('for', props.for);

    // Set up common element properties
    setupElement(element, props, children);
  } else {
    // If no props, just add the children - filter out falsy values
    children.forEach((child) => {
      if (child !== null && child !== undefined && child !== false && child !== 0 && child !== '') {
        if (typeof child === 'string' || typeof child === 'number') {
          element.appendChild(document.createTextNode(String(child)));
        } else {
          element.appendChild(child);
        }
      }
    });
  }

  return element;
}

/**
 * Creates an anchor element.
 *
 * Creates a link element with optional props and children. Anchor elements
 * support all standard element props plus `href` and `target` properties
 * for controlling the link behavior.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps with anchor-specific props)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An anchor element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple link with text
 * const element = a('Click here');
 *
 * // Link with href
 * const element = a(
 *   { href: 'https://example.com' },
 *   'Visit Example'
 * );
 *
 * // Link with target
 * const element = a(
 *   {
 *     href: 'https://example.com',
 *     target: '_blank'
 *   },
 *   'Open in new tab'
 * );
 *
 * // Link with event handler
 * const element = a(
 *   {
 *     href: '#',
 *     onClick: (e) => {
 *       e.preventDefault();
 *       console.log('Link clicked');
 *     },
 *     classNames: 'custom-link'
 *   },
 *   'Custom action'
 * );
 *
 * // Link with icon and text
 * const element = a(
 *   {
 *     href: '/profile',
 *     classNames: 'profile-link'
 *   },
 *   span({ classNames: 'icon' }, '👤'),
 *   span('Profile')
 * );
 *
 * // Link with conditional href
 * const isLoggedIn = signal(false);
 * const element = a(
 *   {
 *     href: isLoggedIn.get() ? '/dashboard' : '/login',
 *     classNames: ['nav-link', { 'active': isLoggedIn.get() }]
 *   },
 *   isLoggedIn.get() ? 'Dashboard' : 'Login'
 * );
 * ```
 */
export function a(
  props?: string | number | (ElementProps & { href?: string; target?: string }),
  ...children: ElementChildren
): HTMLAnchorElement {
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
 * Creates a paragraph element.
 *
 * Creates a paragraph element with optional props and children. Paragraph
 * elements are typically used for blocks of text content.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A paragraph element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple paragraph with text
 * const element = p('This is a paragraph.');
 *
 * // Paragraph with props and text
 * const element = p({ classNames: 'description' }, 'Product description here.');
 *
 * // Paragraph with event handler
 * const element = p(
 *   {
 *     onClick: () => console.log('Paragraph clicked'),
 *     classNames: 'clickable-text'
 *   },
 *   'Click this text'
 * );
 *
 * // Paragraph with mixed content
 * const element = p(
 *   { classNames: 'mixed-content' },
 *   'This paragraph contains ',
 *   span({ classNames: 'highlight' }, 'highlighted text'),
 *   ' and regular text.'
 * );
 *
 * // Paragraph with reactive content
 * const message = signal('Loading...');
 * const element = p(
 *   { classNames: 'status-message' },
 *   message.get()
 * );
 * ```
 */
export function p(...children: ElementChildren): HTMLParagraphElement;
export function p(props: ElementProps, ...children: ElementChildren): HTMLParagraphElement;
export function p(
  propsOrChild?: ElementProps | ElementChildren[0],
  ...children: ElementChildren
): HTMLParagraphElement {
  const element = document.createElement('p');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a span element.
 *
 * Creates an inline span element with optional props and children. Span
 * elements are typically used for inline text styling and grouping.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A span element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple span with text
 * const element = span('Inline text');
 *
 * // Span with props and text
 * const element = span({ classNames: 'highlight' }, 'Important text');
 *
 * // Span with event handler
 * const element = span(
 *   {
 *     onClick: () => console.log('Span clicked'),
 *     classNames: 'clickable-span'
 *   },
 *   'Click me'
 * );
 *
 * // Span for text styling
 * const element = p(
 *   'This is a paragraph with ',
 *   span({ classNames: 'bold' }, 'bold text'),
 *   ' and ',
 *   span({ classNames: 'italic' }, 'italic text'),
 *   '.'
 * );
 *
 * // Span with reactive content
 * const count = signal(0);
 * const element = span(
 *   { classNames: 'counter' },
 *   `Count: ${count.get()}`
 * );
 *
 * // Span with conditional styling
 * const isError = signal(false);
 * const element = span(
 *   {
 *     classNames: ['status', { 'error': isError.get() }],
 *     style: isError.get() ? 'color: red;' : 'color: green;'
 *   },
 *   isError.get() ? 'Error occurred' : 'Success'
 * );
 * ```
 */
export function span(...children: ElementChildren): HTMLSpanElement;
export function span(props: ElementProps, ...children: ElementChildren): HTMLSpanElement;
export function span(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLSpanElement {
  const element = document.createElement('span');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a pre element.
 *
 * Creates a preformatted text element that preserves whitespace and line breaks.
 * Pre elements are typically used for displaying code, formatted text, or any
 * content where whitespace preservation is important.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A pre element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple pre with text
 * const element = pre('function hello() {\n  console.log("Hello");\n}');
 *
 * // Pre with props and code
 * const element = pre(
 *   { classNames: 'code-block' },
 *   'const greeting = "Hello, World!";\nconsole.log(greeting);'
 * );
 *
 * // Pre with event handler
 * const element = pre(
 *   {
 *     onClick: () => console.log('Code block clicked'),
 *     classNames: 'clickable-code'
 *   },
 *   'Click me to copy this code'
 * );
 *
 * // Pre for displaying formatted data
 * const jsonData = JSON.stringify({ name: 'John', age: 30 }, null, 2);
 * const element = pre(
 *   { classNames: 'json-display' },
 *   jsonData
 * );
 *
 * // Pre with reactive content
 * const code = signal('console.log("Hello")');
 * const element = pre(
 *   { classNames: 'dynamic-code' },
 *   code.get()
 * );
 *
 * // Pre with conditional styling
 * const isError = signal(false);
 * const element = pre(
 *   {
 *     classNames: ['code-block', { 'error': isError.get() }],
 *     style: isError.get() ? 'border-color: red;' : 'border-color: green;'
 *   },
 *   isError.get() ? 'Error in code' : 'Valid code'
 * );
 * ```
 */
export function pre(...children: ElementChildren): HTMLPreElement;
export function pre(props: ElementProps, ...children: ElementChildren): HTMLPreElement;
export function pre(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLPreElement {
  const element = document.createElement('pre');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a form element.
 *
 * Creates a form element for collecting user input. Forms can contain various
 * input elements and handle submission events.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A form element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple form
 * const element = form(
 *   { onsubmit: (e) => e.preventDefault() },
 *   input({ type: 'text', placeholder: 'Name' }),
 *   button({ type: 'submit' }, 'Submit')
 * );
 *
 * // Form with validation
 * const element = form(
 *   {
 *     onsubmit: handleSubmit,
 *     classNames: 'contact-form'
 *   },
 *   label('Name:'),
 *   input({ type: 'text', required: true }),
 *   label('Email:'),
 *   input({ type: 'email', required: true }),
 *   button({ type: 'submit' }, 'Send')
 * );
 * ```
 */
export function form(...children: ElementChildren): HTMLFormElement;
export function form(props: ElementProps, ...children: ElementChildren): HTMLFormElement;
export function form(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLFormElement {
  const element = document.createElement('form');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a textarea element.
 *
 * Creates a multi-line text input element for longer text content.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A textarea element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple textarea
 * const element = textarea({ placeholder: 'Enter your message...' });
 *
 * // Textarea with specific dimensions
 * const element = textarea(
 *   {
 *     rows: 5,
 *     cols: 50,
 *     placeholder: 'Enter your message...',
 *     oninput: (e) => console.log(e.target.value)
 *   }
 * );
 *
 * // Textarea with reactive value
 * const message = signal('');
 * const element = textarea(
 *   {
 *     value: message.get(),
 *     oninput: (e) => message.set(e.target.value),
 *     classNames: 'message-input'
 *   }
 * );
 * ```
 */
export function textarea(...children: ElementChildren): HTMLTextAreaElement;
export function textarea(props: ElementProps, ...children: ElementChildren): HTMLTextAreaElement;
export function textarea(
  propsOrChild?: ElementProps | ElementChildren[0],
  ...children: ElementChildren
): HTMLTextAreaElement {
  const element = document.createElement('textarea');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a select element.
 *
 * Creates a dropdown selection element with options.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of option elements
 * @returns A select element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple select with options
 * const element = select(
 *   { onchange: (e) => console.log(e.target.value) },
 *   option({ value: 'option1' }, 'Option 1'),
 *   option({ value: 'option2' }, 'Option 2'),
 *   option({ value: 'option3' }, 'Option 3')
 * );
 *
 * // Select with reactive value
 * const selected = signal('option1');
 * const element = select(
 *   {
 *     value: selected.get(),
 *     onchange: (e) => selected.set(e.target.value),
 *     classNames: 'country-select'
 *   },
 *   option({ value: 'us' }, 'United States'),
 *   option({ value: 'ca' }, 'Canada'),
 *   option({ value: 'uk' }, 'United Kingdom')
 * );
 * ```
 */
export function select(...children: ElementChildren): HTMLSelectElement;
export function select(props: ElementProps, ...children: ElementChildren): HTMLSelectElement;
export function select(
  propsOrChild?: ElementProps | ElementChildren[0],
  ...children: ElementChildren
): HTMLSelectElement {
  const element = document.createElement('select');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an option element.
 *
 * Creates an option element for use within select elements.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An option element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple option
 * const element = option({ value: 'option1' }, 'Option 1');
 *
 * // Option with additional attributes
 * const element = option(
 *   {
 *     value: 'option1',
 *     disabled: true,
 *     classNames: 'disabled-option'
 *   },
 *   'Disabled Option'
 * );
 * ```
 */
export function option(...children: ElementChildren): HTMLOptionElement;
export function option(props: ElementProps, ...children: ElementChildren): HTMLOptionElement;
export function option(
  propsOrChild?: ElementProps | ElementChildren[0],
  ...children: ElementChildren
): HTMLOptionElement {
  const element = document.createElement('option');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a section element.
 *
 * Creates a section element for grouping related content.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A section element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple section
 * const element = section(
 *   { classNames: 'content-section' },
 *   h2('About Us'),
 *   p('This is the about section content.')
 * );
 *
 * // Section with reactive content
 * const isVisible = signal(true);
 * const element = when(isVisible, () =>
 *   section(
 *     { classNames: 'dynamic-section' },
 *     h2('Dynamic Content'),
 *     p('This section shows/hides based on state.')
 *   )
 * );
 * ```
 */
export function section(...children: ElementChildren): HTMLElement;
export function section(props: ElementProps, ...children: ElementChildren): HTMLElement;
export function section(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLElement {
  const element = document.createElement('section');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an article element.
 *
 * Creates an article element for self-contained content.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An article element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple article
 * const element = article(
 *   { classNames: 'blog-post' },
 *   h1('Blog Post Title'),
 *   p('Blog post content goes here...')
 * );
 *
 * // Article with metadata
 * const element = article(
 *   { classNames: 'news-article' },
 *   header(
 *     h1('News Headline'),
 *     p({ classNames: 'date' }, 'Published on January 1, 2024')
 *   ),
 *   p('News content...')
 * );
 * ```
 */
export function article(...children: ElementChildren): HTMLElement;
export function article(props: ElementProps, ...children: ElementChildren): HTMLElement;
export function article(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLElement {
  const element = document.createElement('article');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, propsOrChild as ElementProps, children);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a header element.
 *
 * Creates a header element for introductory content or navigation.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A header element with the specified props and children
 *
 * @example
 * // Simple header
 * const element = header(
 *   { classNames: 'page-header' },
 *   h1('Page Title'),
 *   nav(
 *     a({ href: '/home' }, 'Home'),
 *     a({ href: '/about' }, 'About'),
 *     a({ href: '/contact' }, 'Contact')
 *   )
 * );
 *
 * // Header with reactive title
 * const title = signal('Dynamic Title');
 * const element = header(
 *   { classNames: 'dynamic-header' },
 *   h1(title.get()),
 *   p('Subtitle content')
 * );
 * ```
 */
export function header(...children: ElementChildren): HTMLElement;
export function header(props: ElementProps, ...children: ElementChildren): HTMLElement;
export function header(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLElement {
  const element = document.createElement('header');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a footer element.
 *
 * Creates a footer element for closing content or metadata.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A footer element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple footer
 * const element = footer(
 *   { classNames: 'page-footer' },
 *   p('© 2024 Company Name. All rights reserved.'),
 *   nav(
 *     a({ href: '/privacy' }, 'Privacy Policy'),
 *     a({ href: '/terms' }, 'Terms of Service')
 *   )
 * );
 *
 * // Footer with dynamic year
 * const currentYear = signal(new Date().getFullYear());
 * const element = footer(
 *   { classNames: 'dynamic-footer' },
 *   p(`© ${currentYear.get()} Company Name`)
 * );
 * ```
 */
export function footer(...children: ElementChildren): HTMLElement;
export function footer(props: ElementProps, ...children: ElementChildren): HTMLElement;
export function footer(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLElement {
  const element = document.createElement('footer');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a nav element.
 *
 * Creates a navigation element for navigation links.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A nav element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple navigation
 * const element = nav(
 *   { classNames: 'main-nav' },
 *   a({ href: '/home' }, 'Home'),
 *   a({ href: '/about' }, 'About'),
 *   a({ href: '/contact' }, 'Contact')
 * );
 *
 * // Navigation with active state
 * const currentPage = signal('home');
 * const element = nav(
 *   { classNames: 'site-nav' },
 *   a({
 *     href: '/home',
 *     classNames: currentPage.get() === 'home' ? 'active' : ''
 *   }, 'Home'),
 *   a({
 *     href: '/about',
 *     classNames: currentPage.get() === 'about' ? 'active' : ''
 *   }, 'About')
 * );
 * ```
 */
export function nav(...children: ElementChildren): HTMLElement;
export function nav(props: ElementProps, ...children: ElementChildren): HTMLElement;
export function nav(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLElement {
  const element = document.createElement('nav');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a main element.
 *
 * Creates a main element for the primary content of the document.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A main element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple main content
 * const element = main(
 *   { classNames: 'main-content' },
 *   h1('Page Title'),
 *   p('Main content goes here...')
 * );
 *
 * // Main with multiple sections
 * const element = main(
 *   { classNames: 'app-main' },
 *   section(h2('Section 1'), p('Content 1')),
 *   section(h2('Section 2'), p('Content 2'))
 * );
 * ```
 */
export function main(...children: ElementChildren): HTMLElement;
export function main(props: ElementProps, ...children: ElementChildren): HTMLElement;
export function main(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLElement {
  const element = document.createElement('main');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an aside element.
 *
 * Creates an aside element for content that is tangentially related to the main content.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An aside element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple sidebar
 * const element = aside(
 *   { classNames: 'sidebar' },
 *   h3('Related Links'),
 *   ul(
 *     li(a({ href: '/link1' }, 'Link 1')),
 *     li(a({ href: '/link2' }, 'Link 2'))
 *   )
 * );
 *
 * // Aside with reactive content
 * const isExpanded = signal(false);
 * const element = aside(
 *   {
 *     classNames: ['sidebar', { 'expanded': isExpanded.get() }],
 *     onclick: () => isExpanded.set(!isExpanded.get())
 *   },
 *   h3('Sidebar'),
 *   when(isExpanded, () => p('Expanded content...'))
 * );
 * ```
 */
export function aside(...children: ElementChildren): HTMLElement;
export function aside(props: ElementProps, ...children: ElementChildren): HTMLElement;
export function aside(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLElement {
  const element = document.createElement('aside');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an h4 element.
 *
 * Creates a level 4 heading element.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An h4 element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple h4
 * const element = h4('Subsection Title');
 *
 * // H4 with props
 * const element = h4(
 *   { classNames: 'subsection-heading' },
 *   'Subsection Title'
 * );
 * ```
 */
export function h4(...children: ElementChildren): HTMLHeadingElement;
export function h4(props: ElementProps, ...children: ElementChildren): HTMLHeadingElement;
export function h4(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLHeadingElement {
  const element = document.createElement('h4');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an h5 element.
 *
 * Creates a level 5 heading element.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An h5 element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple h5
 * const element = h5('Minor Section Title');
 *
 * // H5 with props
 * const element = h5(
 *   { classNames: 'minor-heading' },
 *   'Minor Section Title'
 * );
 * ```
 */
export function h5(...children: ElementChildren): HTMLHeadingElement;
export function h5(props: ElementProps, ...children: ElementChildren): HTMLHeadingElement;
export function h5(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLHeadingElement {
  const element = document.createElement('h5');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an h6 element.
 *
 * Creates a level 6 heading element.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An h6 element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple h6
 * const element = h6('Smallest Heading');
 *
 * // H6 with props
 * const element = h6(
 *   { classNames: 'smallest-heading' },
 *   'Smallest Heading'
 * );
 * ```
 */
export function h6(...children: ElementChildren): HTMLHeadingElement;
export function h6(props: ElementProps, ...children: ElementChildren): HTMLHeadingElement;
export function h6(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLHeadingElement {
  const element = document.createElement('h6');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a strong element.
 *
 * Creates a strong element for important text (typically displayed as bold).
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A strong element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple strong text
 * const element = strong('Important text');
 *
 * // Strong with props
 * const element = strong(
 *   { classNames: 'highlight' },
 *   'Highlighted important text'
 * );
 *
 * // Strong within paragraph
 * const element = p(
 *   'This is a paragraph with ',
 *   strong('important text'),
 *   ' that stands out.'
 * );
 * ```
 */
export function strong(...children: ElementChildren): HTMLElement;
export function strong(props: ElementProps, ...children: ElementChildren): HTMLElement;
export function strong(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLElement {
  const element = document.createElement('strong');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an em element.
 *
 * Creates an emphasis element for emphasized text (typically displayed as italic).
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An em element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple emphasized text
 * const element = em('Emphasized text');
 *
 * // Em with props
 * const element = em(
 *   { classNames: 'italic-text' },
 *   'Styled emphasized text'
 * );
 *
 * // Em within paragraph
 * const element = p(
 *   'This is a paragraph with ',
 *   em('emphasized text'),
 *   ' that draws attention.'
 * );
 * ```
 */
export function em(...children: ElementChildren): HTMLSpanElement;
export function em(props: ElementProps, ...children: ElementChildren): HTMLSpanElement;
export function em(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLSpanElement {
  const element = document.createElement('em');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a code element.
 *
 * Creates an inline code element for displaying code snippets.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A code element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple inline code
 * const element = code('const x = 42;');
 *
 * // Code with props
 * const element = code(
 *   { classNames: 'inline-code' },
 *   'function hello() { return "world"; }'
 * );
 *
 * // Code within paragraph
 * const element = p(
 *   'Use the ',
 *   code('console.log()'),
 *   ' function to output to the console.'
 * );
 * ```
 */
export function code(...children: ElementChildren): HTMLElement;
export function code(props: ElementProps, ...children: ElementChildren): HTMLElement;
export function code(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLElement {
  const element = document.createElement('code');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a ul element.
 *
 * Creates an unordered list element for displaying lists of items.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of li elements
 * @returns A ul element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple unordered list
 * const element = ul(
 *   li('First item'),
 *   li('Second item'),
 *   li('Third item')
 * );
 *
 * // List with props
 * const element = ul(
 *   { classNames: 'feature-list' },
 *   li('Feature 1'),
 *   li('Feature 2'),
 *   li('Feature 3')
 * );
 *
 * // List with reactive items
 * const items = signal(['Apple', 'Banana', 'Cherry']);
 * const element = ul(
 *   { classNames: 'fruit-list' },
 *   ...items.get().map(item => li(item))
 * );
 * ```
 */
export function ul(...children: ElementChildren): HTMLUListElement;
export function ul(props: ElementProps, ...children: ElementChildren): HTMLUListElement;
export function ul(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLUListElement {
  const element = document.createElement('ul');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an ol element.
 *
 * Creates an ordered list element for displaying numbered lists of items.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of li elements
 * @returns An ol element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple ordered list
 * const element = ol(
 *   li('First step'),
 *   li('Second step'),
 *   li('Third step')
 * );
 *
 * // List with props
 * const element = ol(
 *   { classNames: 'instruction-list' },
 *   li('Read the manual'),
 *   li('Follow the steps'),
 *   li('Test the result')
 * );
 *
 * // List with reactive items
 * const steps = signal(['Step 1', 'Step 2', 'Step 3']);
 * const element = ol(
 *   { classNames: 'dynamic-steps' },
 *   ...steps.get().map(step => li(step))
 * );
 * ```
 */
export function ol(...children: ElementChildren): HTMLOListElement;
export function ol(props: ElementProps, ...children: ElementChildren): HTMLOListElement;
export function ol(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLOListElement {
  const element = document.createElement('ol');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an li element.
 *
 * Creates a list item element for use within ul or ol elements.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An li element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple list item
 * const element = li('List item text');
 *
 * // List item with props
 * const element = li(
 *   { classNames: 'highlighted-item' },
 *   'Highlighted list item'
 * );
 *
 * // List item with complex content
 * const element = li(
 *   { classNames: 'complex-item' },
 *   strong('Bold text'),
 *   ' and regular text with ',
 *   code('inline code')
 * );
 * ```
 */
export function li(...children: ElementChildren): HTMLLIElement;
export function li(props: ElementProps, ...children: ElementChildren): HTMLLIElement;
export function li(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLLIElement {
  const element = document.createElement('li');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a blockquote element.
 *
 * Creates a blockquote element for quoted content.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A blockquote element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple blockquote
 * const element = blockquote('This is a quoted text.');
 *
 * // Blockquote with props
 * const element = blockquote(
 *   { classNames: 'famous-quote' },
 *   'Be the change you wish to see in the world.'
 * );
 *
 * // Blockquote with citation
 * const element = blockquote(
 *   { classNames: 'quote-with-citation' },
 *   'The only way to do great work is to love what you do.',
 *   footer('— Steve Jobs')
 * );
 * ```
 */
export function blockquote(...children: ElementChildren): HTMLQuoteElement;
export function blockquote(props: ElementProps, ...children: ElementChildren): HTMLQuoteElement;
export function blockquote(
  propsOrChild?: ElementProps | ElementChildren[0],
  ...children: ElementChildren
): HTMLQuoteElement {
  const element = document.createElement('blockquote');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an img element.
 *
 * Creates an image element for displaying images.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An img element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple image
 * const element = img({ src: '/path/to/image.jpg', alt: 'Description' });
 *
 * // Image with props
 * const element = img({
 *   src: '/logo.png',
 *   alt: 'Company Logo',
 *   classNames: 'company-logo',
 *   width: 200,
 *   height: 100
 * });
 *
 * // Responsive image
 * const element = img({
 *   src: '/hero.jpg',
 *   alt: 'Hero Image',
 *   classNames: 'responsive-image',
 *   style: 'max-width: 100%; height: auto;'
 * });
 * ```
 */
export function img(...children: ElementChildren): HTMLImageElement;
export function img(props: ElementProps, ...children: ElementChildren): HTMLImageElement;
export function img(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLImageElement {
  const element = document.createElement('img');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates an hr element.
 *
 * Creates a horizontal rule element for thematic breaks.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns An hr element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple horizontal rule
 * const element = hr();
 *
 * // Styled horizontal rule
 * const element = hr({
 *   classNames: 'section-divider',
 *   style: 'border: 2px solid #ccc; margin: 20px 0;'
 * });
 *
 * // HR between sections
 * const element = div(
 *   section(h2('Section 1'), p('Content...')),
 *   hr({ classNames: 'section-break' }),
 *   section(h2('Section 2'), p('Content...'))
 * );
 * ```
 */
export function hr(...children: ElementChildren): HTMLHRElement;
export function hr(props: ElementProps, ...children: ElementChildren): HTMLHRElement;
export function hr(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLHRElement {
  const element = document.createElement('hr');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Creates a br element.
 *
 * Creates a line break element.
 *
 * @param props - Optional props (can be a string/number for text content, or ElementProps object)
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A br element with the specified props and children
 *
 * @example
 * ```typescript
 * // Simple line break
 * const element = br();
 *
 * // Line break with props
 * const element = br({ classNames: 'spacing-break' });
 *
 * // Line breaks in text
 * const element = div(
 *   'First line',
 *   br(),
 *   'Second line',
 *   br(),
 *   'Third line'
 * );
 * ```
 */
export function br(...children: ElementChildren): HTMLBRElement;
export function br(props: ElementProps, ...children: ElementChildren): HTMLBRElement;
export function br(propsOrChild?: ElementProps | ElementChildren[0], ...children: ElementChildren): HTMLBRElement {
  const element = document.createElement('br');

  if (typeof propsOrChild === 'string' || typeof propsOrChild === 'number') {
    setupTextElement(element, propsOrChild, children);
  } else if (
    propsOrChild &&
    typeof propsOrChild === 'object' &&
    !('tagName' in propsOrChild) &&
    !(propsOrChild instanceof HTMLElement)
  ) {
    setupElement(element, propsOrChild, children);
  } else if (propsOrChild) {
    setupElement(element, {}, [propsOrChild as any, ...children]);
  } else {
    setupElement(element, {}, children);
  }

  return element;
}

/**
 * Renders a component into a container.
 *
 * This function mounts a component or element into a DOM container. It's the
 * primary way to display components in the DOM. The container is cleared
 * before the new content is added.
 *
 * @param component - The component to render (can be a component function, element, or render function)
 * @param container - The DOM element to render the component into
 *
 * @example
 * ```typescript
 * // Render a component
 * const Counter = component((props, utils) => {
 *   const count = utils.signal(0);
 *
 *   return div(
 *     h1(`Count: ${count.get()}`),
 *     button({ onClick: () => count.set(count.get() + 1) }, 'Increment')
 *   );
 * });
 *
 * // Mount to DOM
 * render(Counter(), document.getElementById('app')!);
 *
 * // Or render directly
 * render(Counter, document.getElementById('app')!);
 *
 * // Render an existing element
 * const element = div('Hello World');
 * render(element, document.getElementById('app')!);
 *
 * // Render with a render function
 * const renderFn = () => div('Dynamic content');
 * render(renderFn, document.getElementById('app')!);
 * ```
 */
export function render(component: HTMLElement | (() => HTMLElement) | Component<any>, container: HTMLElement): void {
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
 * Cleans up a component and removes it from the DOM.
 *
 * This function removes a component element from its parent container and
 * triggers cleanup of any associated resources. It's useful for manually
 * managing component lifecycle when you need to remove components
 * programmatically.
 *
 * Note: Components automatically clean up their signals and effects when
 * they're unmounted, so manual cleanup is typically only needed for
 * special cases.
 *
 * @param element - The DOM element to clean up and remove
 *
 * @example
 * ```typescript
 * // Create and render a component
 * const Counter = component((props, utils) => {
 *   const count = utils.signal(0);
 *
 *   return div(
 *     h1(`Count: ${count.get()}`),
 *     button({ onClick: () => count.set(count.get() + 1) }, 'Increment')
 *   );
 * });
 *
 * const counterElement = Counter();
 * render(counterElement, document.getElementById('app')!);
 *
 * // Later, clean up the component
 * cleanup(counterElement);
 *
 * // The component is now removed from the DOM and all its
 * // signals and effects are automatically cleaned up
 * ```
 *
 * @example
 * ```typescript
 * // Cleanup in a conditional rendering scenario
 * const isVisible = signal(true);
 * let currentElement: HTMLElement | null = null;
 *
 * effect(() => {
 *   if (isVisible.get()) {
 *     // Create and show component
 *     currentElement = MyComponent();
 *     render(currentElement, document.getElementById('app')!);
 *   } else if (currentElement) {
 *     // Clean up when hiding
 *     cleanup(currentElement);
 *     currentElement = null;
 *   }
 * });
 *
 * // Toggle visibility
 * isVisible.set(false); // Component is cleaned up
 * isVisible.set(true);  // Component is recreated
 * ```
 */
export function cleanup(element: HTMLElement): void {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Conditionally renders content based on a signal value.
 *
 * This function creates a reactive element that automatically shows/hides content
 * based on whether the signal value is truthy. The content re-renders whenever
 * the signal changes.
 *
 * @param condition - A signal or computed value that determines whether to render
 * @param renderFn - A function that returns the content to render when condition is truthy
 * @returns An HTMLElement that conditionally renders content
 *
 * @example
 * ```typescript
 * // Basic conditional rendering
 * const isVisible = signal(true);
 * const element = when(isVisible, () => div('This is visible'));
 *
 * // With computed values
 * const count = signal(0);
 * const isPositive = computed(() => count.get() > 0);
 * const element = when(isPositive, () => div(`Count is positive: ${count.get()}`));
 *
 * // In a component
 * const MyComponent = component((props, utils) => {
 *   const showHeader = utils.signal(true);
 *
 *   return div(
 *     when(showHeader, () => h1('Conditional Header')),
 *     p('Always visible content')
 *   );
 * });
 * ```
 */
export function when<T>(condition: Signal<T> | ReadonlySignal<T> | T, renderFn: () => HTMLElement): HTMLElement {
  // Create a container element that will hold the conditional content
  const container = document.createElement('div');

  // Function to check if the condition is truthy
  const isTruthy = (value: T): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  };

  // Function to update the container content
  const updateContent = () => {
    // Clear existing content
    container.innerHTML = '';

    // Check if condition is truthy
    let shouldRender = false;
    let currentValue: T;

    if (typeof condition === 'function' && 'get' in condition && 'subscribe' in condition) {
      // It's a signal or computed value
      const signalOrComputed = condition as any; // Type assertion to avoid value property requirement
      currentValue = signalOrComputed.get();
      shouldRender = isTruthy(currentValue);
    } else {
      // It's a static value
      currentValue = condition as T;
      shouldRender = isTruthy(currentValue);
    }

    // Render content if condition is truthy
    if (shouldRender) {
      try {
        const content = renderFn();
        container.appendChild(content);
      } catch (error) {
        console.error('Error rendering conditional content:', error);
      }
    }
  };

  // Set up effect to track changes and re-render
  if (typeof condition === 'function' && 'get' in condition && 'subscribe' in condition) {
    // It's a signal or computed value, so we need to track dependencies
    effect(() => {
      // Access the signal value to track dependencies
      const signalOrComputed = condition as any; // Type assertion to avoid value property requirement
      signalOrComputed.get();
      updateContent();
    });
  } else {
    // Static value, just render once
    updateContent();
  }

  return container;
}

/**
 * Maps over an array signal to render a list of elements.
 *
 * This function creates a reactive list that automatically updates when the
 * array signal changes. It can optionally filter items using a selector function.
 *
 * @param arraySignal - A signal or computed value that contains an array
 * @param renderFn - A function that renders each item in the array
 * @param selector - Optional function to filter which items to render
 * @returns An HTMLElement that contains the mapped list
 *
 * @example
 * ```typescript
 * // Basic array mapping
 * const items = signal(['a', 'b', 'c']);
 * const list = map(items, (item) => div(item));
 *
 * // With filtering
 * const numbers = signal([1, 2, 3, 4, 5]);
 * const evenNumbers = map(numbers, (num) => div(num), (num) => num % 2 === 0);
 *
 * // In a component
 * const TodoList = component((props, utils) => {
 *   const todos = utils.signal(['Learn React', 'Build app', 'Deploy']);
 *
 *   return div(
 *     h1('Todo List'),
 *     map(todos, (todo) => div({ classNames: 'todo-item' }, todo))
 *   );
 * });
 * ```
 */
export function map<T>(
  arraySignal: Signal<T[]> | ReadonlySignal<T[]> | T[],
  renderFn: (item: T, index: number) => HTMLElement,
  selector?: (item: T, index: number) => boolean,
): HTMLElement {
  // Create a container element that will hold the mapped content
  const container = document.createElement('div');

  // Function to update the container content
  const updateContent = () => {
    // Clear existing content
    container.innerHTML = '';

    // Get the current array value
    let currentArray: T[];

    if (typeof arraySignal === 'function' && 'get' in arraySignal && 'subscribe' in arraySignal) {
      // It's a signal or computed value
      const signalOrComputed = arraySignal as any; // Type assertion to avoid value property requirement
      currentArray = signalOrComputed.get();
    } else {
      // It's a static array
      currentArray = arraySignal as T[];
    }

    // Ensure we have an array
    if (!Array.isArray(currentArray)) {
      console.warn('map function received non-array value:', currentArray);
      return;
    }

    // Filter items if selector is provided
    const itemsToRender = selector ? currentArray.filter((item, index) => selector(item, index)) : currentArray;

    // Render each item
    itemsToRender.forEach((item, index) => {
      try {
        const element = renderFn(item, index);
        container.appendChild(element);
      } catch (error) {
        console.error(`Error rendering item at index ${index}:`, error, item);
      }
    });
  };

  // Set up effect to track changes and re-render
  if (typeof arraySignal === 'function' && 'get' in arraySignal && 'subscribe' in arraySignal) {
    // It's a signal or computed value, so we need to track changes
    effect(() => {
      // Access the signal value to track dependencies
      const signalOrComputed = arraySignal as Signal<T[]> | ReadonlySignal<T[]>;
      signalOrComputed.get();
      updateContent();
    });
  } else {
    // Static array, just render once
    updateContent();
  }

  return container;
}

/**
 * Creates a fragment that renders multiple elements without a wrapper container.
 *
 * Fragments are useful when you need to return multiple elements from a component
 * or conditional rendering without adding an extra DOM node. The fragment itself
 * is not rendered to the DOM - only its children are.
 *
 * @param children - Any number of children (strings, numbers, or HTMLElements)
 * @returns A DocumentFragment containing the children
 *
 * @example
 * ```typescript
 * // Basic fragment usage
 * const elements = fragment(
 *   div('First element'),
 *   div('Second element'),
 *   div('Third element')
 * );
 *
 * // In a component that needs to return multiple elements
 * const MyComponent = component((props, utils) => {
 *   const showHeader = utils.signal(true);
 *   const showFooter = utils.signal(true);
 *
 *   return fragment(
 *     when(showHeader, () => h1('Header')),
 *     div('Main content'),
 *     when(showFooter, () => footer('Footer'))
 *   );
 * });
 *
 * // With conditional rendering
 * const ConditionalList = component((props, utils) => {
 *   const items = utils.signal(['a', 'b', 'c']);
 *
 *   return fragment(
 *     h1('List'),
 *     map(items, (item) => div(item)),
 *     button('Add Item')
 *   );
 * });
 * ```
 */
export function fragment(...children: ElementChildren): DocumentFragment {
  const fragment = document.createDocumentFragment();

  children.forEach((child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      // Create text node for strings and numbers
      fragment.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof HTMLElement) {
      // Append HTMLElement directly
      fragment.appendChild(child);
    } else if (child && typeof child === 'object' && 'firstChild' in child) {
      // If it's already a fragment, append its children
      const docFragment = child as DocumentFragment;
      while (docFragment.firstChild) {
        fragment.appendChild(docFragment.firstChild);
      }
    } else if (child !== null && child !== undefined) {
      // Handle other types by converting to string
      fragment.appendChild(document.createTextNode(String(child)));
    }
  });

  return fragment;
}

/**
 * Creates an error boundary that wraps a component with error handling capabilities.
 *
 * Error boundaries catch errors during rendering, in lifecycle methods, and in constructors
 * of the wrapped component. When an error occurs, the fallback component is rendered instead.
 *
 * @param Component - The component to wrap with error handling
 * @param options - Configuration options for the error boundary
 * @returns A new component with error boundary functionality
 *
 * @example
 * ```typescript
 * // Basic error boundary
 * const SafeComponent = errorBoundary(MyComponent, {
 *   fallback: (error) => div('Something went wrong!'),
 *   onError: (error) => console.error('Component error:', error)
 * });
 *
 * // Error boundary with detailed fallback
 * const SafeCounter = errorBoundary(Counter, {
 *   fallback: (error) => div(
 *     { classNames: 'error-boundary' },
 *     h1('Error occurred'),
 *     p(`Error: ${error.message}`),
 *     button({ onClick: () => window.location.reload() }, 'Reload page')
 *   ),
 *   onError: (error, errorInfo) => {
 *     console.error('Counter error:', error);
 *     // Send to error reporting service
 *     reportError(error, errorInfo);
 *   }
 * });
 *
 * // Usage
 * render(SafeComponent, document.getElementById('app'));
 * ```
 */
export function errorBoundary<P = {}>(
  Component: Component<P>,
  options: {
    fallback: (error: Error, errorInfo?: any) => HTMLElement;
    onError?: (error: Error, errorInfo?: any) => void;
  },
): Component<P> {
  return (props?: P) => {
    try {
      // Attempt to render the wrapped component
      return Component(props);
    } catch (error) {
      // Log the error if onError handler is provided
      if (options.onError) {
        const errorInfo = { componentStack: Component.name || 'Unknown' };
        options.onError(error as Error, errorInfo);
      }

      // Render the fallback UI
      return options.fallback(error as Error, { componentStack: Component.name || 'Unknown' });
    }
  };
}
