import { button, component, div, render, useSignal } from '../../src/index';
import { globalCounter, incrementGlobal } from './store';

// Main app component
const app = component(() => {
  // Local signal - only accessible within this component
  const localCounter = useSignal(0);

  console.log('localCounter', localCounter.get());

  const incrementLocal = () => {
    localCounter.update((prev) => prev + 1);
    console.log(`local counter: ${localCounter.get()}`);
  };

  return div(
    {
      className:
        'min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light p-4',
    },
    div(
      { className: 'card p-4' },
      div(
        { className: 'card-header text-center mb-4 bg-transparent border-0' },
        div(
          { className: 'h3 mb-2 text-primary fw-bold' },
          'Simple Signals Demo',
        ),
        div(
          { className: 'text-muted' },
          'Global vs Local Signals with Reactive Updates',
        ),
      ),
      div(
        { className: 'card-body' },
        // Global counter display
        div(
          {
            className:
              'mb-4 p-3 bg-success bg-opacity-10 border border-success rounded',
          },
          div(
            { className: 'd-flex align-items-center justify-content-between' },
            div({ className: 'h6 mb-0 text-muted' }, 'Global Counter'),
            div({ className: 'h2 mb-0 text-success' }, globalCounter.get()),
            button(
              {
                onclick: incrementGlobal,
                className: 'btn btn-success',
              },
              'Increment Global',
            ),
          ),
        ),
        // Local counter display
        div(
          {
            className:
              'mb-4 p-3 bg-warning bg-opacity-10 border border-warning rounded',
          },
          div(
            { className: 'd-flex align-items-center justify-content-between' },
            div({ className: 'h6 mb-0 text-muted' }, 'Local Counter'),
            div({ className: 'h2 mb-0 text-warning' }, localCounter.get()),
            button(
              {
                onclick: incrementLocal,
                className: 'btn btn-warning',
              },
              'Increment Local',
            ),
          ),
        ),
        // Info section
        div(
          {
            className:
              'p-3 bg-info bg-opacity-10 border border-info rounded text-center',
          },
          div({ className: 'h6 mb-2' }, 'How it works'),
          div(
            { className: 'small text-muted' },
            'The global counter persists across component re-renders and automatically decrements every second, while the local counter resets each time. ' +
              'Both automatically update the UI when their values change!',
          ),
        ),
      ),
    ),
  );
});

// Mount the application
render(app, document.getElementById('app')!);
