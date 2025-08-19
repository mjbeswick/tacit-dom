import { button, createReactiveComponent, div, render } from '../../src/index';
import {
  computedC,
  signalA,
  signalB,
  updateA,
  updateB,
  updateBAsync,
} from './store';

const app = createReactiveComponent(() => {
  console.log(`app renders: ${signalA.get()} ${signalB.get()}`);

  const handleUpdateA = () => {
    updateA();
  };

  const handleUpdateB = () => {
    updateB();
  };

  const handleUpdateBAsync = () => {
    updateBAsync().catch(console.error);
  };

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
        div({ className: 'h4 mb-0' }, 'Signal Demo'),
      ),
      div(
        { className: 'card-body' },
        div(
          { className: 'mb-3 p-3 bg-info bg-opacity-10 rounded' },
          div({ className: 'fw-bold text-info' }, 'Signal A:'),
          div({ className: 'fs-5' }, signalA.get()),
        ),
        div(
          { className: 'mb-4 p-3 bg-success bg-opacity-10 rounded' },
          div({ className: 'fw-bold text-success' }, 'Signal B:'),
          div({ className: 'fs-5' }, signalB.get()),
          div(
            { className: 'fs-6 text-muted' },
            signalB.pending ? '⏳ Updating...' : '✅ Ready',
          ),
        ),
        div(
          { className: 'mb-4 p-3 bg-warning bg-opacity-10 rounded' },
          div({ className: 'fw-bold text-warning' }, 'Computed C:'),
          div({ className: 'fs-5' }, computedC.get()),
        ),
        div(
          { className: 'd-flex justify-content-center gap-3' },
          button(
            {
              onclick: handleUpdateA,
              className: 'btn btn-info btn-lg px-4',
            },
            'Update A',
          ),
          button(
            {
              onclick: handleUpdateB,
              className: 'btn btn-success btn-lg px-4',
            },
            'Update B',
          ),
          button(
            {
              onclick: handleUpdateBAsync,
              className: 'btn btn-warning btn-lg px-4',
              disabled: signalB.pending,
            },
            'Update B (Async)',
          ),
        ),
      ),
    ),
  );
});

// Render the app
render(app, document.getElementById('app')!);
