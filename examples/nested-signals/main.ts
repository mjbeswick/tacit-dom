import { button, component, div, h1, p, render, signal } from '../../src/index';

// Counter component with its own local signal
const counter = component((props: { title: string; initialValue?: number }) => {
  console.log('counter renders');
  // Each Counter instance has its own local signal
  const count = signal(props.initialValue || 0);

  console.log('count', count.get());

  const increment = () => {
    count.update((prev) => prev + 1);
    console.log(`${props.title} counter:`, count.get());
  };

  const decrement = () => {
    count.update((prev) => prev - 1);
    console.log(`${props.title} counter:`, count.get());
  };

  const reset = () => {
    count.set(props.initialValue || 0);
    console.log(`${props.title} counter reset to:`, count.get());
  };

  return div(
    { className: 'card mb-3 border-2' },
    div(
      { className: 'card-header bg-primary text-white' },
      h1({ className: 'card-title mb-0' }, props.title),
    ),
    div(
      { className: 'card-body text-center' },
      div({ className: 'display-4 mb-3 text-primary fw-bold' }, count.get()),
      div(
        { className: 'd-flex justify-content-center gap-2' },
        button(
          {
            onclick: decrement,
            className: 'btn btn-outline-danger',
          },
          '-',
        ),
        button(
          {
            onclick: reset,
            className: 'btn btn-outline-secondary',
          },
          'Reset',
        ),
        button(
          {
            onclick: increment,
            className: 'btn btn-outline-success',
          },
          '+',
        ),
      ),
    ),
  );
});

// Main app component
const app = component(() => {
  console.log('app renders');

  return div(
    {
      className: 'min-vh-100 bg-light py-4',
    },
    div(
      { className: 'container' },
      // Header
      div(
        { className: 'text-center mb-5' },
        h1(
          { className: 'display-4 text-primary fw-bold mb-3' },
          'Two Counters with Local Signals',
        ),
        p(
          { className: 'lead text-muted' },
          'This demo shows 2 counter components, each with their own isolated local signals. ',
          'Try clicking the buttons to see if they update independently!',
        ),
      ),

      // Two Counters
      div(
        { className: 'row' },
        div(
          { className: 'col-md-6' },
          counter({ title: 'Counter A', initialValue: 0 }),
        ),
      ),

      // Footer info
      div(
        { className: 'mt-5 text-center' },
        div(
          {
            className: 'alert alert-info d-inline-block',
          },
          h1({ className: 'h6 mb-2' }, '🔍 What to observe:'),
          div(
            { className: 'small' },
            '• Each counter should maintain its own independent state',
            div('• Clicking + or - on Counter A should only affect Counter A'),
            div('• Clicking + or - on Counter B should only affect Counter B'),
            div('• Check the browser console for state change logs!'),
          ),
        ),
      ),
    ),
  );
});

// Mount the application
render(app, document.getElementById('app')!);
