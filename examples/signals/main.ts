import { button, component, div, render } from '../../src/index';
import {
  computedC,
  signalA,
  signalB,
  updateA,
  updateB,
  updateBAsync,
} from './store';

// Example of a component with props
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

// Computed Display Component
const ComputedDisplay = component(() => {
  return div(
    { className: 'mb-4 p-3 bg-warning bg-opacity-10 rounded' },
    div({ className: 'fw-bold text-warning' }, 'Computed C:'),
    div({ className: 'fs-5' }, computedC.get()),
  );
});

// Button Component with Loading State
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
        div(
          {
            className: 'd-flex align-items-center justify-content-center gap-2',
            style: loading ? 'visibility: hidden' : '',
          },
          children,
        ),
        loading &&
          div({
            className: 'spinner-border spinner-border-sm position-absolute',
            role: 'status',
          }),
      ),
    );
  },
);

// Button Group Component
const ButtonGroup = component(() => {
  const handleUpdateA = () => {
    updateA();
  };

  const handleUpdateB = () => {
    updateB();
  };

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
        handleUpdateB();
        handleUpdateBAsync();
      },
      className: 'btn-success btn-lg px-4',
      loading: signalB.pending,
      children: 'Update B (Async)',
    }),
  );
});

// Main App Component
const app = component(() => {
  console.log(`app renders: ${signalA.get()} ${signalB.get()}`);

  console.log(`render signalA ${signalA.get()}`);
  console.log(`render signalB ${signalB.get()}`);

  return div(
    {
      className:
        'min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light',
    },
    div(
      { className: 'card p-4 shadow-sm' },
      div(
        { className: 'card-header text-center mb-3' },
        div({ className: 'h4 mb-0' }, 'Signal Demo with Props'),
      ),
      div(
        { className: 'card-body' },
        // Using the new component with props
        SignalDisplay({
          title: 'Signal A',
          value: signalA.get(),
          className: 'bg-info bg-opacity-10',
        }),
        SignalDisplay({
          title: 'Signal B',
          value: signalB.get(),
          className: 'bg-success bg-opacity-10',
        }),
        ComputedDisplay(),
        ButtonGroup(),
      ),
    ),
  );
});

// Render the app
render(app, document.getElementById('app')!);
