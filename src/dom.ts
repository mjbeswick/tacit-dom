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
import {
  computed,
  effect,
  signal,
  type Computed,
  type Signal,
} from './signals';

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
    console.warn(
      'Tacit-DOM: The "className" prop is deprecated and will be removed in a future version. ' +
        'Use "classNames" instead. See docs/MIGRATION_GUIDE.md for migration help.',
    );
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
  computed: <T>(computeFn: () => T) => Computed<T>;
  /** Creates a component-scoped effect */
  effect: (
    fn: () => void | (() => void),
    options?: { allowRecursion?: boolean },
  ) => void;
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
export function component<P = {}>(
  renderFn: (props: P, utils: ComponentUtils) => HTMLElement,
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
            currentComponentContext.signals.set(
              signalKey,
              signal(initialValue),
            );
          }

          return currentComponentContext.signals.get(signalKey) as Signal<T>;
        },
        computed: <T>(computeFn: () => T): Computed<T> => {
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
            currentComponentContext.signals.set(
              computedKey,
              computedValue as any,
            );
          }

          return currentComponentContext.signals.get(
            computedKey,
          ) as Computed<T>;
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
