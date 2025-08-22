/**
 * @fileoverview Tacit-DOM - Clean, Preact-like reactive system
 *
 * This is a complete rewrite that works like Preact/React:
 * - Components re-render when signals change
 * - Signals persist across re-renders
 * - Effects track dependencies automatically
 * - No complex instance management
 */

// Export the new signals system
export { batch, computed, effect, signal, type ReadonlySignal, type Signal } from './signals';

// Export the new DOM system
export {
  a,
  article,
  aside,
  blockquote,
  br,
  button,
  cleanup,
  code,
  component,
  div,
  em,
  errorBoundary,
  footer,
  form,
  fragment,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  header,
  hr,
  img,
  input,
  label,
  li,
  main,
  map,
  nav,
  ol,
  option,
  p,
  pre,
  render,
  section,
  select,
  span,
  strong,
  textarea,
  ul,
  when,
  type Component,
  type ComponentUtils,
} from './dom';

// Export utility types
export { className } from './classes';
export type { ClassValue } from './classes';
export type { ElementChildren, ElementProps } from './dom';
