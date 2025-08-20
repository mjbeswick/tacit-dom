import { button, component, div, render, signal } from '../../src/index';
import {
  computedC,
  signalA,
  signalB,
  updateA,
  updateB,
  updateBAsync,
} from './store';

// Create a local signal to demonstrate component-scoped state
// This signal is accessible to the app component and persists across renders
const localCounter = signal(0);

// Helper function to increment the local counter
const incrementLocal = () => {
  localCounter.set(localCounter.get() + 1);
  console.log(`local counter: ${localCounter.get()}`);
};

/**
 * Button Component
 *
 * A reusable button component that demonstrates how to create interactive elements.
 * This component shows how to handle events and manage loading states.
 *
 * HOW IT WORKS:
 * - Takes props for onclick handler, className, loading state, and children
 * - Renders a button with appropriate styling and disabled state when loading
 * - The loading prop comes from a signal's .pending state (e.g., signalB.pending)
 * - When loading is true, the button is disabled to prevent multiple clicks
 *
 * PROPS:
 * - onclick: Function to call when button is clicked
 * - className: CSS classes for styling
 * - loading: Boolean to show loading state and disable button
 * - children: Text content to display on the button
 *
 * @returns A button element with event handling and loading state
 */
const Button = component<{
  onclick: () => void;
  className?: string;
  loading?: boolean;
  children: string;
}>((props) => {
  return button(
    {
      onclick: props?.onclick,
      className: `btn ${props?.className || ''}`,
      disabled: props?.loading,
    },
    props?.loading ? 'Loading...' : props?.children || 'Button',
  );
});

/**
 * SignalDisplay Component
 *
 * A reusable component for displaying signal values with consistent styling.
 * This component demonstrates how to create reusable UI components.
 *
 * HOW IT WORKS:
 * - Takes props for title, value, and optional className
 * - The value prop comes from a signal.get() call, making it reactive
 * - When the signal changes, this component automatically re-renders
 * - The className prop allows for custom styling per instance
 *
 * PROPS:
 * - title: The label to display above the value
 * - value: The current value to display (should come from a signal)
 * - className: Optional CSS classes for custom styling
 *
 * REACTIVE BEHAVIOR:
 * - This component subscribes to whatever signal provides the value prop
 * - When that signal changes, the component automatically re-renders
 * - The display updates in real-time as signals change
 *
 * @returns A div element showing the signal title and value
 */
const SignalDisplay = component<{
  title: string;
  value: number;
  className?: string;
  onUpdate?: () => void;
}>((props) => {
  return div(
    { className: `mb-4 p-4 ${props?.className || ''} rounded shadow-sm` },
    div(
      { className: 'h6 mb-2 text-muted fw-semibold' },
      props?.title || 'Signal',
    ),
    div({ className: 'h3 mb-0 fw-bold' }, props?.value || 0),
  );
});

/**
 * ComputedDisplay Component
 *
 * Displays the computed value that automatically updates when its dependencies change.
 * This component shows how computed values work in the reactive system.
 *
 * HOW IT WORKS:
 * - This component directly calls computedC.get() in its render function
 * - This makes the component subscribe to the computed signal
 * - When signalA or signalB change, computedC recalculates
 * - The component automatically re-renders with the new computed value
 *
 * REACTIVE BEHAVIOR:
 * - Direct subscription to computedC
 * - Automatic re-rendering when computedC changes
 * - Transitive dependency: changes to signalA/signalB → computedC → this component
 *
 * @returns A div element showing the computed signal value
 */
const ComputedDisplay = component(() => {
  const status = computedC.get();

  return div(
    { className: 'mb-4 p-4 bg-gradient rounded shadow-sm border' },
    div(
      { className: 'd-flex justify-content-between align-items-center mb-3' },
      div({ className: 'h5 mb-0 text-primary' }, 'Combined Signal Display'),
      div({ className: 'badge bg-primary fs-6' }, status.total + ' Total'),
    ),
    div(
      { className: 'row g-3' },
      div(
        { className: 'col-md-6' },
        div(
          { className: 'text-center p-3 bg-light rounded' },
          div({ className: 'h4 text-success mb-1' }, status.percentageA + '%'),
          div({ className: 'text-muted' }, 'Signal A Percentage'),
        ),
      ),
      div(
        { className: 'col-md-6' },
        div(
          { className: 'text-center p-3 bg-light rounded' },
          div({ className: 'h4 text-danger mb-1' }, status.percentageB + '%'),
          div({ className: 'text-muted' }, 'Signal B Percentage'),
        ),
      ),
    ),
    div(
      { className: 'mt-3 p-3 bg-info bg-opacity-10 rounded text-center' },
      div({ className: 'h6 text-info mb-1' }, status.summary),
      div({ className: 'fs-4 fw-bold text-dark' }, status.score),
    ),
  );
});

/**
 * ButtonGroup Component
 *
 * Contains the main action buttons for updating the signal values.
 * Demonstrates signal updates, async operations, and loading state management.
 *
 * HOW IT WORKS:
 * - This component contains the update logic for both signals
 * - It passes the loading state from signalB.pending to the async button
 * - When buttons are clicked, they call the update functions from store.ts
 * - The update functions change signals, which trigger re-renders throughout the app
 *
 * SIGNAL UPDATE FLOW:
 * 1. User clicks button → update function called
 * 2. Signal value changes → reactive system triggered
 * 3. All components using that signal re-render
 * 4. UI automatically updates to reflect new state
 *
 * ASYNC UPDATE HANDLING:
 * - Async button shows loading state while async operation is pending
 * - Loading state comes from signalB.pending (automatically managed)
 * - Button is disabled during loading to prevent multiple clicks
 *
 * @returns A div containing the update buttons
 */
const ButtonGroup = component(() => {
  // Handler for updating signalA synchronously
  const handleUpdateSignalA = () => {
    updateA();
  };

  // Handler for updating signalB synchronously
  const handleUpdateSignalB = () => {
    updateB();
  };

  // Handler for updating signalB asynchronously
  const handleUpdateSignalBAsync = () => {
    updateBAsync().catch(console.error);
  };

  return div(
    { className: 'mt-4' },
    div(
      { className: 'text-center mb-3' },
      div({ className: 'h5 text-muted' }, 'Primary Signal Controls'),
    ),
    div(
      { className: 'd-flex justify-content-center gap-3 flex-wrap' },
      Button({
        onclick: handleUpdateSignalA,
        className: 'btn-primary btn-lg px-4 py-2',
        children: 'Update Signal A',
      }),
      Button({
        onclick: handleUpdateSignalB,
        className: 'btn-info btn-lg px-4 py-2',
        children: 'Update Signal B',
      }),
      Button({
        onclick: handleUpdateSignalBAsync,
        className: 'btn-warning btn-lg px-4 py-2',
        loading: signalB.pending, // Show loading state while async update is pending
        children: 'Update Signal B (Async)',
      }),
    ),
  );
});

/**
 * Main Application Component
 *
 * This is the root component that orchestrates the entire application.
 * It demonstrates how signals, computed values, and effects work together.
 *
 * HOW IT WORKS:
 * - This is the root component that orchestrates the entire application
 * - It reads signalA.get() and signalB.get() in its render function
 * - This makes the app component subscribe to both signals
 * - When either signal changes, the entire app re-renders
 *
 * REACTIVE UPDATE CYCLE:
 * 1. User clicks button → signal update function called
 * 2. Signal value changes → reactive system triggered
 * 3. All components using that signal re-render
 * 4. Computed values recalculate automatically
 * 5. DOM automatically reflects new state
 *
 * COMPONENT HIERARCHY:
 * app → SignalDisplay(s) + ComputedDisplay + ButtonGroup
 *       ↓
 *       Button(s) with event handlers
 *
 * SIGNAL SUBSCRIPTIONS:
 * - signalA: app component + ComputedDisplay (via computedC)
 * - signalB: app component + ComputedDisplay (via computedC) + ButtonGroup (loading state)
 *
 * @returns The main application layout with signal displays and controls
 */
const app = component(() => {
  // Debug logging to demonstrate when the component re-renders
  // This shows the reactive nature - every time a signal changes, this runs
  console.log(`app renders: ${signalA.get()} ${signalB.get()}`);

  // Additional logging for individual signal access
  // Each .get() call registers this component as a subscriber to that signal
  console.log(`render signalA ${signalA.get()}`);
  console.log(`render signalB ${signalB.get()}`);

  // Log local signal access to show component-level reactivity
  console.log(`local counter: ${localCounter.get()}`);

  return div(
    {
      className:
        'min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light',
    },
    div(
      { className: 'card p-4 shadow-lg border-0' },
      // Header section
      div(
        { className: 'card-header text-center mb-4 bg-transparent border-0' },
        div(
          { className: 'h3 mb-2 text-primary fw-bold' },
          'Reactive Signal Demo',
        ),
        div(
          { className: 'text-muted' },
          'Watch how signals automatically update the UI in real-time!',
        ),
      ),
      // Main content section
      div(
        { className: 'card-body' },
        // Display signalA with info styling
        // The value prop comes from signalA.get(), so this updates when signalA changes
        SignalDisplay({
          title: 'Signal A',
          value: signalA.get(),
          className: 'bg-success bg-opacity-10 border border-success',
        }),
        // Display signalB with success styling
        // The value prop comes from signalB.get(), so this updates when signalB changes
        SignalDisplay({
          title: 'Signal B',
          value: signalB.get(),
          className: 'bg-info bg-opacity-10 border border-info',
        }),
        // Display local counter with warning styling
        // The value prop comes from localCounter.get(), so this updates when localCounter changes
        SignalDisplay({
          title: 'Local Counter',
          value: localCounter.get(),
          className: 'bg-warning bg-opacity-10 border border-warning',
        }),
        // Display computed value
        // This component directly subscribes to computedC and updates automatically
        ComputedDisplay(),

        // Action buttons section with better organization
        ButtonGroup(),
      ),
    ),
  );
});

// Mount the application to the DOM
// The app will automatically re-render whenever signalA or signalB change
//
// HOW MOUNTING WORKS:
// 1. render() calls the app component function
// 2. Component creates DOM elements and returns them
// 3. render() mounts the DOM elements to the container
// 4. Component automatically subscribes to any signals it accessed
// 5. When signals change, component re-runs and DOM updates
//
// REACTIVE SUBSCRIPTION:
// - The app component accessed signalA.get() and signalB.get()
// - This makes the app subscribe to both signals
// - When either signal changes, the app component re-renders
// - The entire UI tree updates automatically
//
// CLEANUP:
// - When the container is removed, all subscriptions are automatically cleaned up
// - No memory leaks or orphaned effects
render(app, document.getElementById('app')!);
