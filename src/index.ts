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
  signal,
  computed,
  effect,
  batch,
  type Signal,
  type Computed,
} from './signals';

// Export the new DOM system
export {
  component,
  useSignal,
  div,
  button,
  h1,
  render,
  type Component,
} from './dom';
