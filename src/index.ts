/**
 * @fileoverview Main entry point for the reactive-dom library.
 *
 * This module exports all the core functionality of the reactive-dom library,
 * including reactive primitives (signals and computations), DOM element creators,
 * utility functions, and TypeScript types.
 *
 * @module reactive-dom
 */

// Export reactive primitives
export { signal, computed, Signal, Computed } from './reactivity';

// Export DOM elements
export {
  div,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  span,
  a,
  button,
  input,
  textarea,
  select,
  option,
  form,
  label,
  ul,
  ol,
  li,
  table,
  tr,
  td,
  th,
  img,
  video,
  audio,
  canvas,
  nav,
  header,
  footer,
  main,
  section,
  article,
  aside,
  details,
  summary,
  dialog,
  menu,
  menuitem,
  pre,
  createElement,
  render,
  cleanup,
} from './reactive-dom';

// Export utility functions
export { classNames, createReactiveList } from './reactive-dom';

// Export router functionality
export { link, router, history } from './router';

// Export types
export type {
  ElementProps,
  ElementChildren,
  ElementCreator,
} from './reactive-dom';

// Export router types
export type {
  Route,
  RouteParams,
  RouteSearch,
  RouterState,
  RouterConfig,
} from './router';
