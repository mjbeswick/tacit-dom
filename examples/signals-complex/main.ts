import { button, component, div, render, signal } from '../../src/index';
import {
  computedC,
  counterA,
  counterB,
  updateA,
  updateB,
  updateBAsync,
} from './store';

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
    { className: `mb-3 p-3 ${props?.className || ''} rounded` },
    div({ className: 'h6 mb-1 text-muted' }, props?.title || 'Counter'),
    div({ className: 'h2 mb-0' }, props?.value || 0),
  );
});

// Display computed value
const ComputedDisplay = component(() => {
  const status = computedC.get();

  return div(
    { className: 'mb-3 p-3 bg-light rounded border' },
    div(
      { className: 'd-flex justify-content-between align-items-center mb-2' },
      div({ className: 'h5 mb-0' }, 'Combined Display'),
      div({ className: 'badge bg-primary' }, status.total + ' Total'),
    ),
    div(
      { className: 'row g-2' },
      div(
        { className: 'col-md-6' },
        div(
          { className: 'text-center p-2 bg-white rounded' },
          div({ className: 'h4 text-success mb-1' }, status.percentageA + '%'),
          div({ className: 'small text-muted' }, 'Counter A'),
        ),
      ),
      div(
        { className: 'col-md-6' },
        div(
          { className: 'text-center p-2 bg-white rounded' },
          div({ className: 'h4 text-danger mb-1' }, status.percentageB + '%'),
          div({ className: 'small text-muted' }, 'Counter B'),
        ),
      ),
    ),
    div(
      { className: 'mt-2 p-2 bg-info bg-opacity-10 rounded text-center' },
      div({ className: 'h6 mb-1' }, status.summary),
      div({ className: 'fs-5' }, status.score),
    ),
  );
});

// Main app component
const app = component(() => {
  // Local counter for component-scoped state
  const localCounter = signal(0);

  const incrementLocal = () => {
    localCounter.update((prev) => prev + 1);
    console.log(`local counter: ${localCounter.get()}`);
  };

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
        div(
          { className: 'row g-2 mt-4' },
          div(
            { className: 'col-12 col-md-6' },
            Button({
              onclick: updateA,
              className: 'btn-success w-100',
              children: 'Update Counter A',
            }),
          ),
          div(
            { className: 'col-12 col-md-6' },
            Button({
              onclick: updateB,
              className: 'btn-info w-100',
              children: 'Update Counter B',
            }),
          ),
          div(
            { className: 'col-12 col-md-6' },
            Button({
              onclick: updateBAsync,
              className: 'btn-warning w-100',
              loading: counterB.pending,
              children: 'Update B Async',
            }),
          ),
          div(
            { className: 'col-12 col-md-6' },
            Button({
              onclick: incrementLocal,
              className: 'btn-secondary w-100',
              children: 'Update Local',
            }),
          ),
        ),
      ),
    ),
  );
});

// Mount the application
render(app, document.getElementById('app')!);
