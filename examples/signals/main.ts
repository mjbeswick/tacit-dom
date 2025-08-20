import { button, component, div, render, signal } from '../../src/index';
import {
  computedC,
  counterA,
  counterB,
  updateA,
  updateB,
  updateBAsync,
} from './store';

// Local counter for component-scoped state
const localCounter = signal(0);
const incrementLocal = () => {
  localCounter.set(localCounter.get() + 1);
  console.log(`local counter: ${localCounter.get()}`);
};

// Button component with loading state
const Button = component<{
  onclick: () => void;
  className?: string;
  loading?: boolean;
  children: string;
}>((props) => {
  return button(
    {
      onclick: props?.onclick,
      className: `btn ${props?.className || ''} position-relative`,
      disabled: props?.loading,
    },
    div(
      {
        className: 'd-flex align-items-center justify-content-center',
        style: props?.loading ? 'visibility: hidden' : '',
      },
      props?.children || 'Button',
    ),
    props?.loading &&
      div(
        {
          className:
            'position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center',
        },
        div({
          className: 'spinner-border spinner-border-sm',
          role: 'status',
        }),
      ),
  );
});

// Display component for counter values
const CounterDisplay = component<{
  title: string;
  value: number;
  className?: string;
}>((props) => {
  return div(
    { className: `mb-4 p-4 ${props?.className || ''} rounded shadow-sm` },
    div(
      { className: 'h6 mb-2 text-muted fw-semibold' },
      props?.title || 'Counter',
    ),
    div({ className: 'h3 mb-0 fw-bold' }, props?.value || 0),
  );
});

// Display computed value
const ComputedDisplay = component(() => {
  const status = computedC.get();

  return div(
    { className: 'mb-4 p-4 bg-gradient rounded shadow-sm border' },
    div(
      { className: 'd-flex justify-content-between align-items-center mb-3' },
      div({ className: 'h5 mb-0 text-primary' }, 'Combined Counter Display'),
      div({ className: 'badge bg-primary fs-6' }, status.total + ' Total'),
    ),
    div(
      { className: 'row g-3' },
      div(
        { className: 'col-md-6' },
        div(
          { className: 'text-center p-3 bg-light rounded' },
          div({ className: 'h4 text-success mb-1' }, status.percentageA + '%'),
          div({ className: 'text-muted' }, 'Counter A Percentage'),
        ),
      ),
      div(
        { className: 'col-md-6' },
        div(
          { className: 'text-center p-3 bg-light rounded' },
          div({ className: 'h4 text-danger mb-1' }, status.percentageB + '%'),
          div({ className: 'text-muted' }, 'Counter B Percentage'),
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

// Button group for counter updates
const ButtonGroup = component(() => {
  return div(
    { className: 'd-flex justify-content-center gap-3 flex-wrap' },
    Button({
      onclick: updateA,
      className: 'btn-primary btn-lg px-4 py-2',
      children: 'Update Counter A',
    }),
    Button({
      onclick: updateB,
      className: 'btn-info btn-lg px-4 py-2',
      children: 'Update Counter B',
    }),
    Button({
      onclick: updateBAsync,
      className: 'btn-warning btn-lg px-4 py-2',
      loading: counterB.pending,
      children: 'Update Counter B (Async)',
    }),
    Button({
      onclick: incrementLocal,
      className: 'btn-success btn-lg px-4 py-2',
      children: 'Increment Local Counter',
    }),
  );
});

// Main app component
const app = component(() => {
  console.log(`app renders: ${counterA.get()} ${counterB.get()}`);

  return div(
    {
      className:
        'min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light',
    },
    div(
      { className: 'card p-4 shadow-lg border-0' },
      div(
        { className: 'card-header text-center mb-4 bg-transparent border-0' },
        div(
          { className: 'h3 mb-2 text-primary fw-bold' },
          'Reactive Counter Demo',
        ),
        div(
          { className: 'text-muted' },
          'Watch how counters automatically update the UI in real-time!',
        ),
      ),
      div(
        { className: 'card-body' },
        CounterDisplay({
          title: 'Counter A',
          value: counterA.get(),
          className: 'bg-success bg-opacity-10 border border-success',
        }),
        CounterDisplay({
          title: 'Counter B',
          value: counterB.get(),
          className: 'bg-info bg-opacity-10 border border-info',
        }),
        CounterDisplay({
          title: 'Local Counter',
          value: localCounter.get(),
          className: 'bg-warning bg-opacity-10 border border-warning',
        }),
        ComputedDisplay(),
        ButtonGroup(),
      ),
    ),
  );
});

// Mount the application
render(app, document.getElementById('app')!);
