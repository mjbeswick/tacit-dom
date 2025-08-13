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
export {
  batch,
  cleanupPreservedSignals,
  clearComponentInstance,
  computed,
  effect,
  setComponentInstance,
  signal,
} from './signals';
export type { Computed, Signal } from './signals';

// DOM exports
export {
  a,
  article,
  aside,
  audio,
  button,
  canvas,
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
  hr,
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
  template,
  textarea,
  th,
  tr,
  ul,
  video,
} from './dom';

// Router exports
export { createRouter, history, link, router } from './router';

// i18n exports
export {
  createI18n,
  getGlobalI18n,
  setGlobalI18n,
  type I18n,
  type I18nConfig,
  type Locale,
  type LocaleData,
  type TranslationKey,
  type TranslationValue,
  type Translations,
} from './i18n';

export {
  formatDate,
  formatNumber,
  n,
  t,
  tWithContext,
  useLocale,
  useNamespace,
} from './i18n-helpers';

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
  HrProps,
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
