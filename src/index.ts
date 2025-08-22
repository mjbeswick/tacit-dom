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
export {
  batch,
  computed,
  effect,
  signal,
  type Computed,
  type Signal,
} from './signals';

// Export the new DOM system
export {
  button,
  cleanup,
  component,
  div,
  h1,
  p,
  render,
  span,
  useSignal,
  type Component,
  type ComponentUtils,
} from './dom';

// Export utility types
export type { ClassValue } from './classes';
