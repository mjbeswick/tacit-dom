import { button, component, div, render, signal } from '../../src/index';
import {
  computerScore,
  gameStatus,
  incrementComputerScore,
  incrementComputerScoreAsync,
  incrementUserScore,
  userScore,
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
  value: number | string;
  className: string;
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
 * GameStatusDisplay Component
 *
 * Displays rich game statistics that automatically update when scores change.
 * This component shows how computed values work in the reactive system.
 *
 * HOW IT WORKS:
 * - This component directly calls gameStatus.get() in its render function
 * - This makes the component subscribe to the computed signal
 * - When userScore or computerScore change, gameStatus recalculates
 * - The component automatically re-renders with the new computed value
 *
 * REACTIVE BEHAVIOR:
 * - Direct subscription to gameStatus
 * - Automatic re-rendering when gameStatus changes
 * - Transitive dependency: changes to userScore/computerScore → gameStatus → this component
 *
 * @returns A div element showing the computed game statistics
 */
const GameStatusDisplay = component(() => {
  const status = gameStatus.get();

  return div(
    { className: 'mb-4 p-4 bg-gradient rounded shadow-sm border' },
    div(
      { className: 'd-flex justify-content-between align-items-center mb-3' },
      div({ className: 'h5 mb-0 text-primary' }, '🎮 Game Statistics'),
      div({ className: 'badge bg-primary fs-6' }, status.totalGames + ' Games'),
    ),
    div(
      { className: 'row g-3' },
      div(
        { className: 'col-md-6' },
        div(
          { className: 'text-center p-3 bg-light rounded' },
          div(
            { className: 'h4 text-success mb-1' },
            status.userPercentage + '%',
          ),
          div({ className: 'text-muted' }, 'Your Win Rate'),
        ),
      ),
      div(
        { className: 'col-md-6' },
        div(
          { className: 'text-center p-3 bg-light rounded' },
          div(
            { className: 'h4 text-danger mb-1' },
            status.computerPercentage + '%',
          ),
          div({ className: 'text-muted' }, 'Computer Win Rate'),
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
 * Contains the main action buttons for updating the score values.
 * Demonstrates signal updates, async operations, and loading state management.
 *
 * HOW IT WORKS:
 * - This component contains the update logic for both scores
 * - It passes the loading state from computerScore.pending to the async button
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
 * - Loading state comes from computerScore.pending (automatically managed)
 * - Button is disabled during loading to prevent multiple clicks
 *
 * @returns A div containing the update buttons
 */
const ButtonGroup = component(() => {
  // Handler for updating userScore synchronously
  const handleIncrementUserScore = () => {
    incrementUserScore();
  };

  // Handler for updating computerScore synchronously
  const handleIncrementComputerScore = () => {
    incrementComputerScore();
  };

  // Handler for updating computerScore asynchronously
  const handleIncrementComputerScoreAsync = () => {
    incrementComputerScoreAsync().catch(console.error);
  };

  return div(
    { className: 'd-flex justify-content-center gap-3 flex-wrap' },
    Button({
      onclick: handleIncrementUserScore,
      className: 'btn-success btn-lg px-4',
      children: '🎯 Score a Point!',
    }),
    Button({
      onclick: handleIncrementComputerScore,
      className: 'btn-info btn-lg px-4',
      children: '🤖 Computer Scores',
    }),
    Button({
      onclick: handleIncrementComputerScoreAsync,
      className: 'btn-warning btn-lg px-4',
      loading: computerScore.pending, // Show loading state while async update is pending
      children: '⏳ Computer Scores (Async)',
    }),
  );
});

// Create a local signal to demonstrate component-scoped state
// This signal is accessible to the app component and persists across renders
const localCounter = signal(0);

// Helper function to increment the local counter
const incrementLocal = () => {
  localCounter.set(localCounter.get() + 1);
  console.log(`local counter: ${localCounter.get()}`);
};

/**
 * Main App Component
 *
 * The root component that demonstrates the reactive signal system.
 * Shows how signals automatically trigger re-renders when their values change.
 *
 * HOW IT WORKS:
 * - This is the root component that orchestrates the entire application
 * - It reads userScore.get() and computerScore.get() in its render function
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
 * app → SignalDisplay(s) + GameStatusDisplay + ButtonGroup
 *       ↓
 *       Button(s) with event handlers
 *
 * SIGNAL SUBSCRIPTIONS:
 * - userScore: app component + GameStatusDisplay (via gameStatus)
 * - computerScore: app component + GameStatusDisplay (via gameStatus) + ButtonGroup (loading state)
 *
 * @returns The main application layout with score displays and controls
 */
const app = component(() => {
  // Debug logging to demonstrate when the component re-renders
  // This shows the reactive nature - every time a signal changes, this runs
  console.log(`app renders: ${userScore.get()} ${computerScore.get()}`);

  // Additional logging for individual signal access
  // Each .get() call registers this component as a subscriber to that signal
  console.log(`render userScore ${userScore.get()}`);
  console.log(`render computerScore ${computerScore.get()}`);

  // Log local signal access to show component-level reactivity
  console.log(`local counter: ${localCounter.get()}`);

  return div(
    {
      className:
        'min-vh-100 d-flex flex-column justify-content-center align-items-center bg-gradient',
      style: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
    },
    div(
      { className: 'card p-4 shadow-lg border-0' },
      // Header section
      div(
        { className: 'card-header text-center mb-4 bg-transparent border-0' },
        div(
          { className: 'h3 mb-2 text-primary fw-bold' },
          '🎮 Reactive Game Demo',
        ),
        div(
          { className: 'text-muted' },
          'Watch how signals automatically update the UI in real-time!',
        ),
      ),
      // Main content section
      div(
        { className: 'card-body' },
        // Display userScore with success styling
        // The value prop comes from userScore.get(), so this updates when userScore changes
        SignalDisplay({
          title: '🎯 Your Score',
          value: userScore.get(),
          className: 'bg-success bg-opacity-10 border border-success',
        }),
        // Display computerScore with info styling
        // The value prop comes from computerScore.get(), so this updates when computerScore changes
        SignalDisplay({
          title: '🤖 Computer Score',
          value: computerScore.get(),
          className: 'bg-info bg-opacity-10 border border-info',
        }),
        // Display local counter with warning styling
        // The value prop comes from localCounter.get(), so this updates when localCounter changes
        SignalDisplay({
          title: '🔢 Local Counter',
          value: localCounter.get(),
          className: 'bg-warning bg-opacity-10 border border-warning',
        }),
        // Display game statistics
        // This component directly subscribes to gameStatus and updates automatically
        GameStatusDisplay(),
        // Action buttons
        // This component manages the loading state and update logic
        // Button controls section
        div(
          { className: 'd-flex gap-2 justify-content-center flex-wrap' },
          // Increment user score button
          Button({
            onclick: incrementUserScore,
            className: 'btn-primary',
            children: '🎯 Score a Point!',
          }),
          // Increment computer score button (asynchronous with loading state)
          Button({
            onclick: incrementComputerScoreAsync,
            className: 'btn-danger',
            loading: computerScore.pending,
            children: '⏳ Computer Scores (Async)',
          }),
          // Increment local counter button
          Button({
            onclick: incrementLocal,
            className: 'btn-warning',
            children: '🔢 Increment Local Counter',
          }),
        ),
      ),
    ),
  );
});

// Mount the application to the DOM
// The app will automatically re-render whenever userScore or computerScore change
//
// HOW MOUNTING WORKS:
// 1. render() function creates the initial DOM from the app component
// 2. The component reads signals and becomes subscribed to them
// 3. When signals change, the component re-renders
// 4. The render function efficiently updates only the changed parts of the DOM
// 5. The UI stays in sync with the reactive state automatically
render(app, document.getElementById('app')!);
