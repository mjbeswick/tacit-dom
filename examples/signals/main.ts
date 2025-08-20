import { button, component, div, render } from '../../src/index';
import {
  computedC,
  signalA,
  signalB,
  updateA,
  updateB,
  updateBAsync,
} from './store';

// ============================================================================
// REACTIVE COMPONENT SYSTEM EXPLANATION
// ============================================================================
//
// This file demonstrates how Tacit-DOM's component system works with signals:
//
// 1. COMPONENTS: Functions that return DOM elements and can access reactive signals
// 2. REACTIVE RENDERING: Components automatically re-render when signals they use change
// 3. PROPS: Components can receive typed parameters for customization
// 4. SIGNAL INTEGRATION: Components can read signals and automatically update when they change
//
// How reactive rendering works:
// - When a component calls .get() on a signal, it becomes "subscribed" to that signal
// - When the signal changes, the component automatically re-renders
// - The render function replaces the old DOM with the new DOM
// - This happens automatically without manual state management
// ============================================================================

/**
 * SignalDisplay Component
 *
 * A reusable component that displays a signal value with customizable styling.
 * Demonstrates how to create components with typed props in Tacit-DOM.
 *
 * HOW IT WORKS:
 * - This component receives props as parameters
 * - It reads the signal value via props.value (which comes from signalA.get() or signalB.get())
 * - When the parent component re-renders due to signal changes, this component gets new props
 * - The new props contain updated values, so the display automatically updates
 *
 * REACTIVE BEHAVIOR:
 * - The component itself doesn't directly subscribe to signals
 * - Instead, it receives updated values through props from its parent
 * - This is a "controlled component" pattern - the parent manages the reactive state
 *
 * @param props - Component properties including title, value, className, and optional onUpdate callback
 * @returns A div element displaying the signal information
 */
const SignalDisplay = component<{
  title: string;
  value: number;
  className: string;
  onUpdate?: () => void;
}>((props) => {
  return div(
    { className: `mb-3 p-3 ${props?.className || ''} rounded` },
    div({ className: 'fw-bold' }, props?.title || 'Signal'),
    div({ className: 'fs-5' }, props?.value || 0),
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
  return div(
    { className: 'mb-4 p-3 bg-warning bg-opacity-10 rounded' },
    div({ className: 'fw-bold text-warning' }, 'Computed C:'),
    div({ className: 'fs-5' }, computedC.get()),
  );
});

/**
 * Button Component with Loading State
 *
 * A reusable button component that supports loading states, disabled states,
 * and custom styling. Demonstrates conditional rendering and state management.
 *
 * HOW IT WORKS:
 * - This component receives props including loading state and click handlers
 * - It conditionally renders different content based on the loading prop
 * - The loading state comes from signalB.pending (async update status)
 * - When loading changes, the button automatically updates its appearance
 *
 * CONDITIONAL RENDERING:
 * - Main content is hidden when loading (visibility: hidden)
 * - Loading spinner is shown when loading is true
 * - Button is disabled when loading or disabled props are true
 *
 * REACTIVE BEHAVIOR:
 * - Receives loading state through props (controlled by parent)
 * - Automatically updates when loading prop changes
 *
 * @param props - Button properties including click handler, styling, and state
 * @returns A button element with optional loading spinner
 */
const Button = component(
  (props?: {
    onclick: () => void;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    children: string;
  }) => {
    if (!props) return div();

    const {
      onclick,
      className = '',
      disabled = false,
      loading = false,
      children,
    } = props;

    return button(
      {
        onclick,
        className: `btn ${className}`,
        disabled: disabled || loading,
      },
      div(
        {
          className:
            'd-flex align-items-center justify-content-center gap-2 position-relative',
        },
        // Main button content (hidden when loading)
        div(
          {
            className: 'd-flex align-items-center justify-content-center gap-2',
            style: loading ? 'visibility: hidden' : '',
          },
          children,
        ),
        // Loading spinner (shown when loading is true)
        loading &&
          div({
            className: 'spinner-border spinner-border-sm position-absolute',
            role: 'status',
          }),
      ),
    );
  },
);

/**
 * ButtonGroup Component
 *
 * Contains the main action buttons for updating signals A and B.
 * Demonstrates signal updates, async operations, and loading state management.
 *
 * HOW IT WORKS:
 * - This component contains the update logic for both signals
 * - It passes the loading state from signalB.pending to the Update B button
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
 * - Update B button shows loading state while async operation is pending
 * - Loading state comes from signalB.pending (automatically managed)
 * - Button is disabled during loading to prevent multiple clicks
 *
 * @returns A div containing the update buttons
 */
const ButtonGroup = component(() => {
  // Handler for updating signal A synchronously
  const handleUpdateA = () => {
    updateA();
  };

  // Handler for updating signal B synchronously
  const handleUpdateB = () => {
    updateB();
  };

  // Handler for updating signal B asynchronously
  const handleUpdateBAsync = () => {
    updateBAsync().catch(console.error);
  };

  return div(
    { className: 'd-flex justify-content-center gap-3' },
    Button({
      onclick: handleUpdateA,
      className: 'btn-info btn-lg px-4',
      children: 'Update A',
    }),
    Button({
      onclick: () => {
        // Update both synchronously and asynchronously
        handleUpdateB();
        handleUpdateBAsync();
      },
      className: 'btn-success btn-lg px-4',
      loading: signalB.pending, // Show loading state while async update is pending
      children: 'Update B (Async)',
    }),
  );
});

/**
 * Main App Component
 *
 * The root component that demonstrates the reactive signal system.
 * Shows how signals automatically trigger re-renders when their values change.
 *
 * HOW IT WORKS:
 * - This is the root component that orchestrates the entire application
 * - It reads signalA.get() and signalB.get() in its render function
 * - This makes the app component subscribe to both signals
 * - When either signal changes, the entire app re-renders
 *
 * REACTIVE RENDERING CYCLE:
 * 1. User clicks button → update function called
 * 2. Signal value changes → app component detects change
 * 3. App component re-renders → all child components get new props
 * 4. Child components update with new values
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

  return div(
    {
      className:
        'min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light',
    },
    div(
      { className: 'card p-4 shadow-sm' },
      // Header section
      div(
        { className: 'card-header text-center mb-3' },
        div({ className: 'h4 mb-0' }, 'Signal Demo with Props'),
      ),
      // Main content section
      div(
        { className: 'card-body' },
        // Display signal A with info styling
        // The value prop comes from signalA.get(), so this updates when signalA changes
        SignalDisplay({
          title: 'Signal A',
          value: signalA.get(),
          className: 'bg-info bg-opacity-10',
        }),
        // Display signal B with success styling
        // The value prop comes from signalB.get(), so this updates when signalB changes
        SignalDisplay({
          title: 'Signal B',
          value: signalB.get(),
          className: 'bg-success bg-opacity-10',
        }),
        // Display computed value
        // This component directly subscribes to computedC and updates automatically
        ComputedDisplay(),
        // Action buttons
        // This component manages the loading state and update logic
        ButtonGroup(),
      ),
    ),
  );
});

// Mount the application to the DOM
// The app will automatically re-render whenever signalA or signalB change
//
// HOW MOUNTING WORKS:
// 1. render() function creates the initial DOM from the app component
// 2. The component reads signals and becomes subscribed to them
// 3. When signals change, the component re-renders
// 4. The render function efficiently updates only the changed parts of the DOM
// 5. The UI stays in sync with the reactive state automatically
render(app, document.getElementById('app')!);

// render(testComponent, document.getElementById('app')!);
