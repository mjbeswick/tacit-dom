/**
 * @fileoverview Main entry point for the reactive-dom library.
 *
 * This module exports all the core functionality of the reactive-dom library,
 * including reactive primitives (signals and computations), DOM element creators,
 * utility functions, and TypeScript types.
 *
 * @module reactive-dom
 */

// Core reactivity exports
export { batch, computed, effect, signal } from './signals';
export type { Signal, Computed } from './signals';

// DOM exports
export {
  a,
  article,
  aside,
  audio,
  button,
  canvas,
  classNames,
  cleanup,
  createElement,
  createReactiveList,
  details,
  dialog,
  div,
  footer,
  form,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  header,
  img,
  input,
  label,
  li,
  main,
  menu,
  menuitem,
  nav,
  ol,
  option,
  p,
  pre,
  render,
  section,
  select,
  span,
  summary,
  table,
  td,
  textarea,
  th,
  tr,
  ul,
  video,
} from './dom';

// Router exports
export { createRouter } from './router';

// Type exports
export type {
  AnchorProps,
  ArticleProps,
  AsideProps,
  AudioProps,
  ButtonProps,
  CanvasProps,
  DetailsProps,
  DialogProps,
  DivProps,
  FooterProps,
  FormProps,
  HeaderProps,
  HeadingProps,
  ImageProps,
  InputProps,
  LabelProps,
  ListItemProps,
  ListProps,
  MainProps,
  MenuItemProps,
  MenuProps,
  NavigationProps,
  OptionProps,
  ParagraphProps,
  PreProps,
  SectionProps,
  SelectProps,
  SpanProps,
  SummaryProps,
  TableCellProps,
  TableProps,
  TableRowProps,
  TextareaProps,
  VideoProps,
} from './dom';
