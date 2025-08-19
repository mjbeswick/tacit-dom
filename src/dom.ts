/**
 * @fileoverview DOM manipulation utilities for the reactive-dom library.
 *
 * This module provides functions for creating HTML elements with reactive properties,
 * handling event listeners, and managing reactive subscriptions. It includes
 * factory functions for all common HTML elements and utilities for rendering
 * and cleanup.
 *
 * @module dom
 */

import {
  Computed,
  effect,
  getReactiveById,
  REACTIVE_MARKER_PREFIX,
  REACTIVE_MARKER_SUFFIX,
  Signal,
} from './signals';

// DOM types for event handling
type EventListener = (_event: Event) => void | Promise<void>;

// Inline classNames function to avoid circular dependency
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
    } else if (typeof input === 'boolean') {
      // Skip boolean values
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

// Creates a reactive node from a string that may include Thorix reactive markers
function createReactiveInterpolatedNode(text: string): HTMLElement {
  const container = document.createElement('span');
  const parts: (string | Signal<any> | Computed<any>)[] = [];
  let index = 0;

  while (index < text.length) {
    const start = text.indexOf(REACTIVE_MARKER_PREFIX, index);
    if (start === -1) {
      if (index < text.length) parts.push(text.slice(index));
      break;
    }
    if (start > index) {
      parts.push(text.slice(index, start));
    }
    const idStart = start + REACTIVE_MARKER_PREFIX.length;
    const end = text.indexOf(REACTIVE_MARKER_SUFFIX, idStart);
    if (end === -1) {
      // No closing suffix; treat rest as static
      parts.push(text.slice(start));
      break;
    }
    const id = text.slice(idStart, end);
    const instance = getReactiveById(id);
    if (instance) {
      parts.push(instance as Signal<any> | Computed<any>);
    } else {
      // Unknown id, keep as plain text
      parts.push(text.slice(start, end + REACTIVE_MARKER_SUFFIX.length));
    }
    index = end + REACTIVE_MARKER_SUFFIX.length;
  }

  const updateText = () => {
    const content = parts
      .map((part) => (isReactive(part) ? String(safeGetValue(part)) : part))
      .join('');
    container.textContent = content;
  };

  updateText();

  parts.forEach((part) => {
    if (isReactive(part)) {
      const unsubscribe = part.subscribe(updateText);
      const existing = reactiveNodes.get(container) || [];
      existing.push({ signal: part, unsubscribe });
      reactiveNodes.set(container, existing);
    }
  });

  return container;
}

// Removed unused parseTemplateString function

/**
 * Creates a reactive template string that can interpolate signals.
 * This is a more powerful alternative to template strings that allows
 * explicit signal binding.
 */
export function template(
  strings: TemplateStringsArray,
  ...values: (Signal<any> | Computed<any> | any)[]
): HTMLElement {
  const container = document.createElement('span');

  // Create initial text content
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

  // Set initial content
  updateText();

  // Subscribe to all reactive values
  values.forEach((value) => {
    if (isReactive(value)) {
      const unsubscribe = value.subscribe(updateText);
      // Store subscription for cleanup
      const existingSubscriptions = reactiveNodes.get(container) || [];
      existingSubscriptions.push({ signal: value, unsubscribe });
      reactiveNodes.set(container, existingSubscriptions);
    }
  });

  return container;
}

// Global state for tracking reactive subscriptions and preventing infinite loops
const reactiveNodes = new Map<
  HTMLElement,
  Array<{
    signal: Signal<any> | Computed<any>;
    unsubscribe: () => void;
  }>
>();

const reactiveValues = new Map<HTMLElement, Map<string, any>>();

// Infinite loop detection
let globalUpdateCount = 0;
const MAX_GLOBAL_UPDATES = 1000;
let lastResetTime = Date.now();

/**
 * Checks if we've exceeded the maximum number of updates to prevent infinite loops.
 * @returns true if updates should be allowed, false if we've hit the limit
 */
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

/**
 * Checks if a value has changed and updates the stored value
 * Uses deep equality for objects and arrays to prevent unnecessary updates
 */
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

/**
 * Deep equality check for objects and arrays
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;

  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Helper function to check if a value is a reactive signal or computed
 */
function isReactive(value: any): value is Signal<any> | Computed<any> {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.get === 'function' &&
    typeof value.subscribe === 'function'
  );
}

/**
 * Safely gets a value from a reactive signal without triggering infinite loops
 */
function safeGetValue(signal: Signal<any> | Computed<any>): any {
  try {
    return signal.get();
  } catch (error) {
    console.error('Error getting signal value:', error);
    return '[Error]';
  }
}

/**
 * Converts camelCase to kebab-case for DOM attributes
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Maps camelCase prop names to their DOM attribute names
 */
function getDomAttributeName(propName: string): string {
  // Special cases that should not be converted
  const specialCases: Record<string, string> = {
    className: 'class',
    htmlFor: 'for',
    autoFocus: 'autofocus',
    formAction: 'formaction',
    formEnctype: 'formenctype',
    formMethod: 'formmethod',
    formNoValidate: 'formnovalidate',
    formTarget: 'formtarget',
  };

  return specialCases[propName] || camelToKebab(propName);
}

// Strongly typed event handlers
type EventHandler<T = Event> = (_event: T) => void | boolean;

// Helper to normalize camelCase React-like event prop names to DOM event names
function getDomEventNameFromProp(propKey: string): string {
  const lowerKey = propKey.toLowerCase();
  const specialCases: Record<string, string> = {
    // React-style onDoubleClick should map to native 'dblclick'
    ondoubleclick: 'dblclick',
  };

  return specialCases[lowerKey] || lowerKey.slice(2);
}

// Common HTML attributes that apply to most elements
type CommonAttributes = {
  id?: string | Signal<string> | Computed<string>;
  className?:
    | string
    | Signal<string>
    | Computed<string>
    | (
        | string
        | number
        | boolean
        | null
        | undefined
        | { [key: string]: any }
        | any[]
      )[];
  classNames?:
    | string
    | number
    | boolean
    | null
    | undefined
    | { [key: string]: any }
    | any[]
    | Signal<
        | string
        | number
        | boolean
        | null
        | undefined
        | { [key: string]: any }
        | any[]
      >
    | Computed<
        | string
        | number
        | boolean
        | null
        | undefined
        | { [key: string]: any }
        | any[]
      >;
  style?: string | Signal<string> | Computed<string>;
  title?: string | Signal<string> | Computed<string>;
  lang?: string | Signal<string> | Computed<string>;
  dir?:
    | 'ltr'
    | 'rtl'
    | 'auto'
    | Signal<'ltr' | 'rtl' | 'auto'>
    | Computed<'ltr' | 'rtl' | 'auto'>;
  hidden?: boolean | Signal<boolean> | Computed<boolean>;
  tabIndex?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  accessKey?: string | Signal<string> | Computed<string>;
  contentEditable?:
    | boolean
    | 'true'
    | 'false'
    | 'inherit'
    | Signal<boolean | 'true' | 'false' | 'inherit'>
    | Computed<boolean | 'true' | 'false' | 'inherit'>;
  spellCheck?:
    | boolean
    | 'true'
    | 'false'
    | Signal<boolean | 'true' | 'false'>
    | Computed<boolean | 'true' | 'false'>;
  draggable?:
    | boolean
    | 'true'
    | 'false'
    | Signal<boolean | 'true' | 'false'>
    | Computed<boolean | 'true' | 'false'>;
  children?: ElementChildren;
};

// Event handlers - React-like camelCase props
type CamelCaseEventHandlers = {
  onAbort?: EventHandler<Event>;
  onBlur?: EventHandler<FocusEvent>;
  onChange?: EventHandler<Event>;
  onClick?: EventHandler<MouseEvent>;
  onContextMenu?: EventHandler<MouseEvent>;
  onCopy?: EventHandler<ClipboardEvent>;
  onCut?: EventHandler<ClipboardEvent>;
  onDoubleClick?: EventHandler<MouseEvent>;
  onDrag?: EventHandler<DragEvent>;
  onDragEnd?: EventHandler<DragEvent>;
  onDragEnter?: EventHandler<DragEvent>;
  onDragLeave?: EventHandler<DragEvent>;
  onDragOver?: EventHandler<DragEvent>;
  onDragStart?: EventHandler<DragEvent>;
  onDrop?: EventHandler<DragEvent>;
  onError?: EventHandler<Event>;
  onFocus?: EventHandler<FocusEvent>;
  onInput?: EventHandler<Event>;
  onKeyDown?: EventHandler<KeyboardEvent>;
  onKeyPress?: EventHandler<KeyboardEvent>;
  onKeyUp?: EventHandler<KeyboardEvent>;
  onLoad?: EventHandler<Event>;
  onMouseDown?: EventHandler<MouseEvent>;
  onMouseMove?: EventHandler<MouseEvent>;
  onMouseOut?: EventHandler<MouseEvent>;
  onMouseOver?: EventHandler<MouseEvent>;
  onMouseUp?: EventHandler<MouseEvent>;
  onPaste?: EventHandler<ClipboardEvent>;
  onReset?: EventHandler<Event>;
  onResize?: EventHandler<UIEvent>;
  onScroll?: EventHandler<Event>;
  onSelect?: EventHandler<Event>;
  onSubmit?: EventHandler<Event>;
  onUnload?: EventHandler<Event>;
  onWheel?: EventHandler<WheelEvent>;
};

// Lowercase event handlers (backward compatibility)
type LowercaseEventHandlers = {
  onabort?: EventHandler<Event>;
  onblur?: EventHandler<FocusEvent>;
  onchange?: EventHandler<Event>;
  onclick?: EventHandler<MouseEvent>;
  oncontextmenu?: EventHandler<MouseEvent>;
  oncopy?: EventHandler<ClipboardEvent>;
  oncut?: EventHandler<ClipboardEvent>;
  ondblclick?: EventHandler<MouseEvent>;
  ondrag?: EventHandler<DragEvent>;
  ondragend?: EventHandler<DragEvent>;
  ondragenter?: EventHandler<DragEvent>;
  ondragleave?: EventHandler<DragEvent>;
  ondragover?: EventHandler<DragEvent>;
  ondragstart?: EventHandler<DragEvent>;
  ondrop?: EventHandler<DragEvent>;
  onerror?: EventHandler<Event>;
  onfocus?: EventHandler<FocusEvent>;
  oninput?: EventHandler<Event>;
  onkeydown?: EventHandler<KeyboardEvent>;
  onkeypress?: EventHandler<KeyboardEvent>;
  onkeyup?: EventHandler<KeyboardEvent>;
  onload?: EventHandler<Event>;
  onmousedown?: EventHandler<MouseEvent>;
  onmousemove?: EventHandler<MouseEvent>;
  onmouseout?: EventHandler<MouseEvent>;
  onmouseover?: EventHandler<MouseEvent>;
  onmouseup?: EventHandler<MouseEvent>;
  onpaste?: EventHandler<ClipboardEvent>;
  onreset?: EventHandler<Event>;
  onresize?: EventHandler<UIEvent>;
  onscroll?: EventHandler<Event>;
  onselect?: EventHandler<Event>;
  onsubmit?: EventHandler<Event>;
  onunload?: EventHandler<Event>;
  onwheel?: EventHandler<WheelEvent>;
};

type EventHandlers = CamelCaseEventHandlers & LowercaseEventHandlers;

// Form-specific attributes
type FormAttributes = {
  name?: string | Signal<string> | Computed<string>;
  value?: string | number | Signal<string | number> | Computed<string | number>;
  disabled?: boolean | Signal<boolean> | Computed<boolean>;
  readonly?: boolean | Signal<boolean> | Computed<boolean>;
  required?: boolean | Signal<boolean> | Computed<boolean>;
  autoComplete?: 'on' | 'off' | Signal<'on' | 'off'> | Computed<'on' | 'off'>;
  autoFocus?: boolean | Signal<boolean> | Computed<boolean>;
  form?: string | Signal<string> | Computed<string>;
  formAction?: string | Signal<string> | Computed<string>;
  formEnctype?:
    | 'application/x-www-form-urlencoded'
    | 'multipart/form-data'
    | 'text/plain'
    | Signal<
        | 'application/x-www-form-urlencoded'
        | 'multipart/form-data'
        | 'text/plain'
      >
    | Computed<
        | 'application/x-www-form-urlencoded'
        | 'multipart/form-data'
        | 'text/plain'
      >;
  formMethod?:
    | 'get'
    | 'post'
    | Signal<'get' | 'post'>
    | Computed<'get' | 'post'>;
  formNoValidate?: boolean | Signal<boolean> | Computed<boolean>;
  formTarget?: string | Signal<string> | Computed<string>;
};

// Input-specific attributes
type InputAttributes = FormAttributes & {
  type?:
    | 'text'
    | 'password'
    | 'email'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'month'
    | 'week'
    | 'color'
    | 'file'
    | 'range'
    | 'checkbox'
    | 'radio'
    | 'submit'
    | 'reset'
    | 'button'
    | 'image'
    | 'hidden'
    | Signal<string>
    | Computed<string>;
  placeholder?: string | Signal<string> | Computed<string>;
  size?: number | string | Signal<number | string> | Computed<number | string>;
  maxLength?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  minLength?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  pattern?: string | Signal<string> | Computed<string>;
  min?: string | number | Signal<string | number> | Computed<string | number>;
  max?: string | number | Signal<string | number> | Computed<string | number>;
  step?: string | number | Signal<string | number> | Computed<string | number>;
  multiple?: boolean | Signal<boolean> | Computed<boolean>;
  accept?: string | Signal<string> | Computed<string>;
  checked?: boolean | Signal<boolean> | Computed<boolean>;
  src?: string | Signal<string> | Computed<string>;
  alt?: string | Signal<string> | Computed<string>;
  width?: number | string | Signal<number | string> | Computed<number | string>;
  height?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
};

// Anchor-specific attributes
type AnchorAttributes = {
  href?: string | Signal<string> | Computed<string>;
  target?:
    | '_blank'
    | '_self'
    | '_parent'
    | '_top'
    | string
    | Signal<string>
    | Computed<string>;
  rel?: string | Signal<string> | Computed<string>;
  download?: string | Signal<string> | Computed<string>;
  hreflang?: string | Signal<string> | Computed<string>;
  type?: string | Signal<string> | Computed<string>;
};

// Image-specific attributes
type ImageAttributes = {
  src?: string | Signal<string> | Computed<string>;
  alt?: string | Signal<string> | Computed<string>;
  width?: number | string | Signal<number | string> | Computed<number | string>;
  height?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  loading?:
    | 'lazy'
    | 'eager'
    | Signal<'lazy' | 'eager'>
    | Computed<'lazy' | 'eager'>;
  decoding?:
    | 'sync'
    | 'async'
    | 'auto'
    | Signal<'sync' | 'async' | 'auto'>
    | Computed<'sync' | 'async' | 'auto'>;
  crossOrigin?:
    | 'anonymous'
    | 'use-credentials'
    | Signal<'anonymous' | 'use-credentials'>
    | Computed<'anonymous' | 'use-credentials'>;
  useMap?: string | Signal<string> | Computed<string>;
  isMap?: boolean | Signal<boolean> | Computed<boolean>;
};

// Video-specific attributes
type VideoAttributes = {
  src?: string | Signal<string> | Computed<string>;
  poster?: string | Signal<string> | Computed<string>;
  preload?:
    | 'none'
    | 'metadata'
    | 'auto'
    | Signal<'none' | 'metadata' | 'auto'>
    | Computed<'none' | 'metadata' | 'auto'>;
  autoplay?: boolean | Signal<boolean> | Computed<boolean>;
  loop?: boolean | Signal<boolean> | Computed<boolean>;
  muted?: boolean | Signal<boolean> | Computed<boolean>;
  controls?: boolean | Signal<boolean> | Computed<boolean>;
  width?: number | string | Signal<number | string> | Computed<number | string>;
  height?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
};

// Audio-specific attributes
type AudioAttributes = {
  src?: string | Signal<string> | Computed<string>;
  preload?:
    | 'none'
    | 'metadata'
    | 'auto'
    | Signal<'none' | 'metadata' | 'auto'>
    | Computed<'none' | 'metadata' | 'auto'>;
  autoplay?: boolean | Signal<boolean> | Computed<boolean>;
  loop?: boolean | Signal<boolean> | Computed<boolean>;
  muted?: boolean | Signal<boolean> | Computed<boolean>;
  controls?: boolean | Signal<boolean> | Computed<boolean>;
};

// Form-specific attributes
type FormElementAttributes = {
  action?: string | Signal<string> | Computed<string>;
  method?: 'get' | 'post' | Signal<'get' | 'post'> | Computed<'get' | 'post'>;
  enctype?:
    | 'application/x-www-form-urlencoded'
    | 'multipart/form-data'
    | 'text/plain'
    | Signal<
        | 'application/x-www-form-urlencoded'
        | 'multipart/form-data'
        | 'text/plain'
      >
    | Computed<
        | 'application/x-www-form-urlencoded'
        | 'multipart/form-data'
        | 'text/plain'
      >;
  target?: string | Signal<string> | Computed<string>;
  novalidate?: boolean | Signal<boolean> | Computed<boolean>;
  accept?: string | Signal<string> | Computed<string>;
  acceptCharset?: string | Signal<string> | Computed<string>;
};

// Label-specific attributes
type LabelAttributes = {
  htmlFor?: string | Signal<string> | Computed<string>;
};

// Select-specific attributes
type SelectAttributes = FormAttributes & {
  multiple?: boolean | Signal<boolean> | Computed<boolean>;
  size?: number | string | Signal<number | string> | Computed<number | string>;
};

// Option-specific attributes
type OptionAttributes = {
  value?: string | number | Signal<string | number> | Computed<string | number>;
  disabled?: boolean | Signal<boolean> | Computed<boolean>;
  selected?: boolean | Signal<boolean> | Computed<boolean>;
  label?: string | Signal<string> | Computed<string>;
};

// Textarea-specific attributes
type TextareaAttributes = FormAttributes & {
  placeholder?: string | Signal<string> | Computed<string>;
  rows?: number | string | Signal<number | string> | Computed<number | string>;
  cols?: number | string | Signal<number | string> | Computed<number | string>;
  maxLength?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  minLength?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  wrap?: 'soft' | 'hard' | Signal<'soft' | 'hard'> | Computed<'soft' | 'hard'>;
  readonly?: boolean | Signal<boolean> | Computed<boolean>;
};

// Table-specific attributes
type TableAttributes = {
  border?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  cellPadding?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  cellSpacing?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
  width?: number | string | Signal<number | string> | Computed<number | string>;
  height?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
};

// Canvas-specific attributes
type CanvasAttributes = {
  width?: number | string | Signal<number | string> | Computed<number | string>;
  height?:
    | number
    | string
    | Signal<number | string>
    | Computed<number | string>;
};

// Details-specific attributes
type DetailsAttributes = {
  open?: boolean | Signal<boolean> | Computed<boolean>;
};

// Dialog-specific attributes
type DialogAttributes = {
  open?: boolean | Signal<boolean> | Computed<boolean>;
};

// Menu-specific attributes
type MenuAttributes = {
  type?:
    | 'context'
    | 'toolbar'
    | Signal<'context' | 'toolbar'>
    | Computed<'context' | 'toolbar'>;
  label?: string | Signal<string> | Computed<string>;
};

// Strongly typed element props for different HTML elements
export type DivProps = CommonAttributes & EventHandlers;
export type HeadingProps = CommonAttributes & EventHandlers;
export type ParagraphProps = CommonAttributes & EventHandlers;
export type SpanProps = CommonAttributes & EventHandlers;
export type AnchorProps = CommonAttributes & AnchorAttributes & EventHandlers;
export type ButtonProps = CommonAttributes & FormAttributes & EventHandlers;
export type InputProps = CommonAttributes & InputAttributes & EventHandlers;
export type TextareaProps = CommonAttributes &
  TextareaAttributes &
  EventHandlers;
export type SelectProps = CommonAttributes & SelectAttributes & EventHandlers;
export type OptionProps = CommonAttributes & OptionAttributes & EventHandlers;
export type FormProps = CommonAttributes &
  FormElementAttributes &
  EventHandlers;
export type LabelProps = CommonAttributes & LabelAttributes & EventHandlers;
export type ListProps = CommonAttributes & EventHandlers;
export type ListItemProps = CommonAttributes & EventHandlers;
export type TableProps = CommonAttributes & TableAttributes & EventHandlers;
export type TableRowProps = CommonAttributes & EventHandlers;
export type TableCellProps = CommonAttributes & EventHandlers;
export type ImageProps = CommonAttributes & ImageAttributes & EventHandlers;
export type VideoProps = CommonAttributes & VideoAttributes & EventHandlers;
export type AudioProps = CommonAttributes & AudioAttributes & EventHandlers;
export type CanvasProps = CommonAttributes & CanvasAttributes & EventHandlers;
export type NavigationProps = CommonAttributes & EventHandlers;
export type HeaderProps = CommonAttributes & EventHandlers;
export type FooterProps = CommonAttributes & EventHandlers;
export type MainProps = CommonAttributes & EventHandlers;
export type SectionProps = CommonAttributes & EventHandlers;
export type ArticleProps = CommonAttributes & EventHandlers;
export type AsideProps = CommonAttributes & EventHandlers;
export type DetailsProps = CommonAttributes & DetailsAttributes & EventHandlers;
export type SummaryProps = CommonAttributes & EventHandlers;
export type DialogProps = CommonAttributes & DialogAttributes & EventHandlers;
export type MenuProps = CommonAttributes & MenuAttributes & EventHandlers;
export type MenuItemProps = CommonAttributes & EventHandlers;
export type PreProps = CommonAttributes & EventHandlers;
export type HrProps = CommonAttributes & EventHandlers;

// Union type for all possible element props
export type ElementProps =
  | DivProps
  | HeadingProps
  | ParagraphProps
  | SpanProps
  | AnchorProps
  | ButtonProps
  | InputProps
  | TextareaProps
  | SelectProps
  | OptionProps
  | FormProps
  | LabelProps
  | ListProps
  | ListItemProps
  | TableProps
  | TableRowProps
  | TableCellProps
  | ImageProps
  | VideoProps
  | AudioProps
  | CanvasProps
  | NavigationProps
  | HeaderProps
  | FooterProps
  | MainProps
  | SectionProps
  | ArticleProps
  | AsideProps
  | DetailsProps
  | SummaryProps
  | DialogProps
  | MenuProps
  | MenuItemProps
  | PreProps
  | HrProps;

/**
 * Type for element children.
 *
 * Children can be strings, numbers, HTML elements, or reactive values
 * (signals and computations).
 */
export type ElementChildren = (
  | string
  | number
  | boolean
  | HTMLElement
  | Signal<any>
  | Computed<any>
  | null
  | undefined
)[];

/**
 * Type for element creator functions.
 *
 * Element creators are functions that create HTML elements with optional
 * properties and children.
 */
export type ElementCreator = (
  _props?: ElementProps | ElementChildren[0],
  ..._children: ElementChildren
) => HTMLElement;

/**
 * WeakMap to track reactive nodes for cleanup.
 *
 * Maps HTML elements to arrays of signal/computation subscriptions
 * that need to be cleaned up when the element is removed.
 */
const reactiveListNodes = new WeakMap<
  HTMLElement,
  Array<{
    signal: Signal<any> | Computed<any>;
    unsubscribe: () => void;
    container: HTMLElement;
  }>
>();

/**
 * Creates a factory function for HTML elements.
 *
 * This function returns an element creator that can create HTML elements
 * with reactive properties and children. The creator handles:
 * - Regular HTML attributes
 * - Event listeners (properties starting with 'on')
 * - Reactive attributes (signals and computations)
 * - Reactive children (signals and computations)
 * - Dynamic class names using the classNames utility
 *
 * @param tagName - The HTML tag name for the element
 * @returns An element creator function
 */
function createElementFactory(tagName: string): ElementCreator {
  return (
    props?: ElementProps | ElementChildren[0],
    ...children: ElementChildren
  ): HTMLElement => {
    try {
      // Handle case where first argument should be treated as children
      if (
        typeof props === 'string' ||
        typeof props === 'number' ||
        typeof props === 'boolean' ||
        props instanceof HTMLElement ||
        isReactive(props)
      ) {
        children = [props, ...children];
        props = {};
      }

      // Ensure props is an object
      props = props || {};
      const element = document.createElement(tagName);

      // Initialize subscriptions array for tracking reactive subscriptions
      const subscriptions: Array<{
        signal: Signal<any> | Computed<any>;
        unsubscribe: () => void;
      }> = [];

      // Handle props
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'children') {
          // Handle children prop specially - prepend to maintain expected order
          if (Array.isArray(value)) {
            children = [...value, ...children];
          } else if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value instanceof HTMLElement ||
            isReactive(value)
          ) {
            children.unshift(value);
          }
        } else if (key.startsWith('on') && typeof value === 'function') {
          // Handle event listeners
          const eventName = getDomEventNameFromProp(key);
          element.addEventListener(eventName, value as EventListener);
        } else {
          // Handle regular attributes
          if (key === 'className') {
            // Handle className with dynamic class name functionality
            if (isReactive(value)) {
              let isUpdating = false;
              const updateClassName = () => {
                // Prevent infinite loops
                if (isUpdating) return;
                if (!checkUpdateLimit()) return;

                isUpdating = true;

                try {
                  const classNameValue = safeGetValue(value);
                  const finalClassName =
                    typeof classNameValue === 'string' ||
                    typeof classNameValue === 'number' ||
                    typeof classNameValue === 'boolean' ||
                    Array.isArray(classNameValue) ||
                    (typeof classNameValue === 'object' &&
                      classNameValue !== null)
                      ? classNames(classNameValue)
                      : String(classNameValue);

                  if (hasValueChanged(element, 'className', finalClassName)) {
                    element.className = finalClassName;
                  }
                } catch (error) {
                  console.error('Error updating className:', error);
                } finally {
                  isUpdating = false;
                }
              };

              // Set initial className without triggering reactive updates
              try {
                const classNameValue = safeGetValue(value);
                const finalClassName =
                  typeof classNameValue === 'string' ||
                  typeof classNameValue === 'number' ||
                  typeof classNameValue === 'boolean' ||
                  Array.isArray(classNameValue) ||
                  (typeof classNameValue === 'object' &&
                    classNameValue !== null)
                    ? classNames(classNameValue)
                    : String(classNameValue);

                element.className = finalClassName;
              } catch (error) {
                console.error('Error setting initial className:', error);
              }

              const unsubscribe = value.subscribe(updateClassName);

              subscriptions.push({ signal: value, unsubscribe });
            } else if (
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean' ||
              Array.isArray(value) ||
              (typeof value === 'object' && value !== null)
            ) {
              element.className = classNames(value);
            } else {
              element.className = String(value);
            }
          } else if (key === 'classNames') {
            // Handle classNames prop with dynamic class name functionality
            if (isReactive(value)) {
              let isUpdating = false;
              const updateClassNames = () => {
                // Prevent infinite loops
                if (isUpdating) return;
                if (!checkUpdateLimit()) return;

                isUpdating = true;

                try {
                  const classNamesValue = safeGetValue(value);
                  const finalClassNames = classNames(classNamesValue);

                  if (hasValueChanged(element, 'className', finalClassNames)) {
                    element.className = finalClassNames;
                  }
                } catch (error) {
                  console.error('Error updating classNames:', error);
                } finally {
                  isUpdating = false;
                }
              };

              // Set initial classNames without triggering reactive updates
              try {
                const classNamesValue = safeGetValue(value);
                const finalClassNames = classNames(classNamesValue);
                element.className = finalClassNames;
              } catch (error) {
                console.error('Error setting initial classNames:', error);
              }

              const unsubscribe = value.subscribe(updateClassNames);

              subscriptions.push({ signal: value, unsubscribe });
            } else {
              element.className = classNames(value);
            }
          } else if (key === 'style') {
            // Handle style with dynamic updates
            if (isReactive(value)) {
              let isUpdating = false;
              const updateStyle = () => {
                // Prevent infinite loops
                if (isUpdating) return;
                if (!checkUpdateLimit()) return;

                isUpdating = true;

                try {
                  const styleValue = safeGetValue(value);
                  const finalStyle = String(styleValue);

                  if (hasValueChanged(element, 'style', finalStyle)) {
                    element.style.cssText = finalStyle;
                  }
                } catch (error) {
                  console.error('Error updating style:', error);
                } finally {
                  isUpdating = false;
                }
              };

              // Set initial style without triggering reactive updates
              try {
                const styleValue = safeGetValue(value);
                const finalStyle = String(styleValue);
                element.style.cssText = finalStyle;
              } catch (error) {
                console.error('Error setting initial style:', error);
              }

              const unsubscribe = value.subscribe(updateStyle);

              subscriptions.push({ signal: value, unsubscribe });
            } else {
              element.style.cssText = String(value);
            }
          } else {
            // Handle other attributes with dynamic updates
            if (isReactive(value)) {
              let isUpdating = false;
              const updateAttribute = () => {
                // Prevent infinite loops
                if (isUpdating) return;
                if (!checkUpdateLimit()) return;

                isUpdating = true;

                try {
                  if (key === 'value' && element instanceof HTMLInputElement) {
                    // Handle input value property specifically
                    const inputValue = String(safeGetValue(value));

                    if (hasValueChanged(element, key, inputValue)) {
                      element.value = inputValue;
                    }
                  } else {
                    const attrValue = safeGetValue(value);

                    if (
                      key === 'disabled' ||
                      key === 'checked' ||
                      key === 'readonly' ||
                      key === 'required' ||
                      key === 'open' ||
                      key === 'autoFocus' ||
                      key === 'formNoValidate'
                    ) {
                      // Handle boolean attributes
                      const newValue = Boolean(attrValue);

                      const domKey = getDomAttributeName(key);
                      if (hasValueChanged(element, key, newValue)) {
                        if (newValue) {
                          element.setAttribute(domKey, '');
                        } else {
                          element.removeAttribute(domKey);
                        }
                      }
                    } else {
                      const stringValue = String(attrValue);
                      const domKey = getDomAttributeName(key);

                      if (hasValueChanged(element, key, stringValue)) {
                        element.setAttribute(domKey, stringValue);
                      }
                    }
                  }
                } catch (error) {
                  console.error(`Error updating attribute ${key}:`, error);
                } finally {
                  isUpdating = false;
                }
              };

              // Set initial attribute without triggering reactive updates
              try {
                const initialValue = safeGetValue(value);

                if (key === 'value' && element instanceof HTMLInputElement) {
                  element.value = String(initialValue);
                } else if (
                  key === 'disabled' ||
                  key === 'checked' ||
                  key === 'readonly' ||
                  key === 'required' ||
                  key === 'open' ||
                  key === 'autoFocus' ||
                  key === 'formNoValidate'
                ) {
                  const domKey = getDomAttributeName(key);
                  if (initialValue) {
                    element.setAttribute(domKey, '');
                  } else {
                    element.removeAttribute(domKey);
                  }
                } else if (
                  key === 'tabIndex' ||
                  key === 'maxLength' ||
                  key === 'minLength' ||
                  key === 'size' ||
                  key === 'width' ||
                  key === 'height' ||
                  key === 'accessKey' ||
                  key === 'contentEditable' ||
                  key === 'loading' ||
                  key === 'decoding' ||
                  key === 'crossOrigin' ||
                  key === 'useMap' ||
                  key === 'draggable' ||
                  key === 'spellcheck' ||
                  key === 'isMap' ||
                  key === 'controls' ||
                  key === 'autoplay' ||
                  key === 'loop' ||
                  key === 'muted'
                ) {
                  // Handle properties that need to be set directly
                  if (
                    key === 'accessKey' ||
                    key === 'contentEditable' ||
                    key === 'loading' ||
                    key === 'decoding' ||
                    key === 'crossOrigin' ||
                    key === 'useMap' ||
                    key === 'draggable'
                  ) {
                    (element as any)[key] = String(value);
                  } else if (
                    key === 'spellcheck' ||
                    key === 'isMap' ||
                    key === 'controls' ||
                    key === 'autoplay' ||
                    key === 'loop' ||
                    key === 'muted'
                  ) {
                    (element as any)[key] = Boolean(value);
                  } else {
                    (element as any)[key] = Number(value);
                  }
                } else if (key === 'autoComplete') {
                  // Handle autocomplete specifically (camelCase to kebab-case)
                  element.setAttribute('autocomplete', String(initialValue));
                } else {
                  const domKey = getDomAttributeName(key);
                  element.setAttribute(domKey, String(initialValue));
                }
              } catch (error) {
                console.error(`Error setting initial attribute ${key}:`, error);
              }

              const unsubscribe = value.subscribe(updateAttribute);

              subscriptions.push({ signal: value, unsubscribe });
            } else {
              if (key === 'value' && element instanceof HTMLInputElement) {
                // Handle input value property specifically
                element.value = String(value);
              } else if (
                key === 'disabled' ||
                key === 'checked' ||
                key === 'readonly' ||
                key === 'required' ||
                key === 'open' ||
                key === 'autoFocus' ||
                key === 'formNoValidate'
              ) {
                // Handle boolean attributes
                const domKey = getDomAttributeName(key);
                if (value) {
                  element.setAttribute(domKey, '');
                } else {
                  element.removeAttribute(domKey);
                }
              } else if (
                key === 'tabIndex' ||
                key === 'maxLength' ||
                key === 'minLength' ||
                key === 'size' ||
                key === 'width' ||
                key === 'height' ||
                key === 'accessKey' ||
                key === 'contentEditable' ||
                key === 'loading' ||
                key === 'decoding' ||
                key === 'crossOrigin' ||
                key === 'useMap' ||
                key === 'draggable' ||
                key === 'spellcheck' ||
                key === 'isMap' ||
                key === 'controls' ||
                key === 'autoplay' ||
                key === 'loop' ||
                key === 'muted'
              ) {
                // Handle properties that need to be set directly
                if (
                  key === 'accessKey' ||
                  key === 'contentEditable' ||
                  key === 'loading' ||
                  key === 'decoding' ||
                  key === 'crossOrigin' ||
                  key === 'useMap' ||
                  key === 'draggable'
                ) {
                  (element as any)[key] = String(value);
                } else if (
                  key === 'spellcheck' ||
                  key === 'isMap' ||
                  key === 'controls' ||
                  key === 'autoplay' ||
                  key === 'loop' ||
                  key === 'muted'
                ) {
                  (element as any)[key] = Boolean(value);
                } else {
                  (element as any)[key] = Number(value);
                }
              } else if (key === 'autoComplete') {
                // Handle autocomplete specifically (camelCase to kebab-case)
                element.setAttribute('autocomplete', String(value));
              } else {
                const attrName = getDomAttributeName(key);
                element.setAttribute(attrName, String(value));
              }
            }
          }
        }
      });

      // Handle children
      children.forEach((child) => {
        if (child === null || child === undefined || child === false) {
          // Skip null/undefined/false children
          return;
        } else if (isReactive(child)) {
          // Handle reactive children
          let isUpdating = false;
          // Persist a single text node for this child
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
                // Update existing text node value
                textNode.nodeValue = String(childValue);
              }
            } catch (error) {
              console.error('Error updating reactive child:', error);
            } finally {
              isUpdating = false;
            }
          };

          // Set initial value
          try {
            const childValue = safeGetValue(child);
            textNode = document.createTextNode(String(childValue));
            element.appendChild(textNode);
          } catch (error) {
            console.error('Error setting initial reactive child:', error);
          }

          const unsubscribe = child.subscribe(updateChild);

          subscriptions.push({ signal: child, unsubscribe });
        } else if (
          typeof child === 'string' ||
          typeof child === 'number' ||
          typeof child === 'boolean'
        ) {
          const stringValue = String(child);
          if (stringValue.includes(REACTIVE_MARKER_PREFIX)) {
            element.appendChild(createReactiveInterpolatedNode(stringValue));
          } else {
            element.appendChild(document.createTextNode(stringValue));
          }
        } else if (child instanceof HTMLElement) {
          element.appendChild(child);
        } else if (
          typeof child === 'object' &&
          child !== null &&
          'tagName' in child &&
          typeof (child as any).tagName === 'string'
        ) {
          // Handle HTML elements in JSDOM environment where instanceof might fail
          element.appendChild(child as HTMLElement);
        }
      });

      // Store subscriptions for cleanup
      if (subscriptions.length > 0) {
        reactiveNodes.set(element, subscriptions);
      }

      return element;
    } catch (error) {
      console.error('Error creating element:', error);
      // Return a fallback element
      const fallbackElement = document.createElement(tagName);
      fallbackElement.textContent = 'Error creating element';
      return fallbackElement;
    }
  };
}

// Create all HTML element factories
export const div = createElementFactory('div');
export const h1 = createElementFactory('h1');
export const h2 = createElementFactory('h2');
export const h3 = createElementFactory('h3');
export const h4 = createElementFactory('h4');
export const h5 = createElementFactory('h5');
export const h6 = createElementFactory('h6');
export const p = createElementFactory('p');
export const span = createElementFactory('span');
export const a = createElementFactory('a');
export const button = createElementFactory('button');
export const input = createElementFactory('input');
export const textarea = createElementFactory('textarea');
export const select = createElementFactory('select');
export const option = createElementFactory('option');
export const form = createElementFactory('form');
export const label = createElementFactory('label');
export const ul = createElementFactory('ul');
export const ol = createElementFactory('ol');
export const li = createElementFactory('li');
export const table = createElementFactory('table');
export const tr = createElementFactory('tr');
export const td = createElementFactory('td');
export const th = createElementFactory('th');
export const img = createElementFactory('img');
export const video = createElementFactory('video');
export const audio = createElementFactory('audio');
export const canvas = createElementFactory('canvas');
export const nav = createElementFactory('nav');
export const header = createElementFactory('header');
export const footer = createElementFactory('footer');
export const main = createElementFactory('main');
export const section = createElementFactory('section');
export const article = createElementFactory('article');
export const aside = createElementFactory('aside');
export const details = createElementFactory('details');
export const summary = createElementFactory('summary');
export const dialog = createElementFactory('dialog');
export const menu = createElementFactory('menu');
export const menuitem = createElementFactory('menuitem');
export const pre = createElementFactory('pre');
export const hr = createElementFactory('hr');

/**
 * Creates a generic element creator for any HTML tag.
 *
 * This function allows you to create element creators for HTML tags
 * that aren't included in the predefined exports.
 *
 * @param tagName - The HTML tag name for the element
 * @returns An element creator function
 *
 * @example
 * ```typescript
 * const customElement = createElement('custom-tag');
 * const element = customElement({ id: 'my-id' }, 'Hello World');
 * ```
 */
export function createElement(tagName: string): ElementCreator {
  return createElementFactory(tagName);
}

/**
 * Cleans up all reactive subscriptions from an element.
 *
 * This function removes all signal and computation subscriptions
 * associated with the given element, preventing memory leaks.
 *
 * @param element - The HTML element to clean up
 */
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

/**
 * Renders a component to a container element.
 *
 * This function clears the container, cleans up any existing reactive
 * subscriptions, and appends the new component. It's useful for
 * mounting components to the DOM.
 *
 * @param component - The component function or HTML element to render
 * @param container - The container element to render into
 * @param props - Optional props to pass to the component
 *
 * @example
 * ```typescript
 * // Render without props
 * const app = div({ className: 'app' }, 'Hello World');
 * render(app, document.getElementById('root'));
 *
 * // Render with props
 * const Greeting = createReactiveComponent<{ name: string }>((props) => {
 *   return div(`Hello, ${props?.name || 'World'}!`);
 * });
 * render(Greeting, document.getElementById('root'), { name: 'Alice' });
 * ```
 */
export function render<P = void>(
  component: (() => HTMLElement) | Component<P>,
  container: HTMLElement,
  props?: P,
): void {
  // Clean up any existing reactive subscriptions
  const existingElements = container.querySelectorAll('*');
  existingElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      cleanupElement(el);
    }
  });

  container.innerHTML = '';

  try {
    // Set container reference for reactive components
    if (
      '_setContainer' in component &&
      typeof component._setContainer === 'function'
    ) {
      component._setContainer(container);
    }

    const element = component(props);
    container.appendChild(element);
  } catch (error) {
    console.error('Error rendering component:', error);
  }
}

/**
 * Manually cleans up reactive subscriptions from a component.
 *
 * This function should be called when you want to remove a component
 * from the DOM to prevent memory leaks from reactive subscriptions.
 *
 * @param component - The HTML element to clean up
 *
 * @example
 * ```typescript
 * const app = div( 'Hello World');
 * // ... use the component
 * cleanup(app); // Clean up when done
 * ```
 */
export function cleanup(component: HTMLElement): void {
  cleanupElement(component);
}

// classNames function is internal only - not exported

/**
 * Creates a reactive list that automatically updates when the source signal changes.
 *
 * This function creates a container element that renders a list of items
 * based on a signal containing an array. When the signal's value changes,
 * the list is automatically re-rendered.
 *
 * @template T - The type of items in the list
 * @param signal - A signal containing an array of items
 * @param renderItem - Function to render each item
 * @returns A container element containing the reactive list
 *
 * @example
 * ```typescript
 * const items = signal(['Apple', 'Banana', 'Cherry']);
 * const list = createReactiveList(items, (item, index) =>
 *   li( item)
 * );
 * ```
 */
export function createReactiveList<T>(
  signal: Signal<T[]>,
  renderItem: (_item: T, _index: number) => HTMLElement,
): HTMLElement {
  const container = document.createElement('div');
  const subscriptions: Array<{
    signal: Signal<any> | Computed<any>;
    unsubscribe: () => void;
    container: HTMLElement;
  }> = [];

  const updateList = () => {
    // Check for infinite update loops
    if (!checkUpdateLimit()) return;

    const newItems = signal.get();

    // Check if the list has actually changed
    const hasChanged = hasValueChanged(
      container,
      'items',
      JSON.stringify(newItems),
    );

    if (!hasChanged) return;

    // Clear existing content
    container.innerHTML = '';

    // Render new items
    newItems.forEach((item, index) => {
      const element = renderItem(item, index);

      container.appendChild(element);
    });
  };

  updateList();
  const unsubscribe = signal.subscribe(updateList);

  subscriptions.push({ signal, unsubscribe, container });

  // Store for cleanup
  reactiveListNodes.set(container, subscriptions);

  return container;
}

export type Component<P = void> = ((props?: P) => HTMLElement) & {
  _setContainer?: (container: HTMLElement) => void;
};

/**
 * Creates a reactive component that automatically re-renders when its dependencies change.
 *
 * This function wraps a component function and sets up automatic re-rendering
 * when any signals or computed values used within the component change.
 *
 * @param component - The component function to make reactive
 * @returns A reactive component function that can be used with render
 *
 * @example
 * ```typescript
 * // Component without props
 * const Counter = createReactiveComponent(() => {
 *   const count = signal(0);
 *   return div(
 *     button({ onclick: () => count.set(count.get() + 1) }, `Count: ${count.get()}`)
 *   );
 * });
 *
 * // Component with props
 * const Greeting = createReactiveComponent<{ name: string }>((props) => {
 *   return div(`Hello, ${props?.name || 'World'}!`);
 * });
 *
 * render(Counter, document.getElementById('app'));
 * render(Greeting({ name: 'Alice' }), document.getElementById('greeting'));
 * ```
 */
export function createReactiveComponent<P = void>(
  component: (props?: P) => HTMLElement,
): Component<P> {
  let currentElement: HTMLElement | null = null;
  let isRendering = false;
  let container: HTMLElement | null = null;
  let effectCleanup: (() => void) | null = null;
  let hasInitialized = false;

  const reactiveComponent = (props?: P) => {
    if (isRendering) {
      // Prevent infinite loops during rendering
      return currentElement!;
    }

    isRendering = true;
    try {
      const element = component(props);
      currentElement = element;

      // Set up the effect after the first render to track dependencies
      if (!hasInitialized && container) {
        hasInitialized = true;
        // Use setTimeout to ensure the effect runs after the render cycle is complete
        setTimeout(() => {
          setupEffect();
        }, 0);
      }

      return element;
    } finally {
      isRendering = false;
    }
  };

  // Set up effect to track dependencies and trigger re-renders
  // This effect will run whenever any signals used in the component change
  const setupEffect = () => {
    if (effectCleanup) {
      effectCleanup();
    }

    effectCleanup = effect(() => {
      // Only proceed if we have a container and we're not currently rendering
      if (container && !isRendering) {
        // Execute the component to establish signal tracking
        // This ensures the effect tracks all signal dependencies
        component();

        // Schedule a re-render when dependencies change
        requestAnimationFrame(() => {
          if (container && !isRendering) {
            // Clear container and render new content
            container.innerHTML = '';
            const newElement = reactiveComponent();
            container.appendChild(newElement);
          }
        });
      }
    });
  };

  // Override the toString to mark this as a reactive component
  const originalToString = reactiveComponent.toString;
  reactiveComponent.toString = (): string => {
    return `[ReactiveComponent: ${originalToString.call(reactiveComponent)}]`;
  };

  // Store the container reference for re-rendering
  reactiveComponent._setContainer = (cont: HTMLElement) => {
    container = cont;
    // Don't set up effect here - wait for first render
  };

  return reactiveComponent;
}
