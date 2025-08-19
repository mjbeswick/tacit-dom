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
  onUpdate: () => void;
}>((props) => {
  return div(
    { className: `mb-3 p-3 ${props?.className || ''} rounded` },
    div({ className: 'fw-bold' }, props?.title || 'Signal'),
    div({ className: 'fs-5' }, props?.value || 0),
    button(
      {
        onclick: props?.onUpdate || (() => {}),
        className: 'btn btn-sm btn-outline-secondary mt-2',
      },
      'Update',
    ),
  );
});

const app = component(() => {
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
        div({ className: 'h4 mb-0' }, 'Signal Demo with Props'),
      ),
      div(
        { className: 'card-body' },
        // Using the new component with props
        SignalDisplay({
          title: 'Signal A',
          value: signalA.get(),
          className: 'bg-info bg-opacity-10',
          onUpdate: handleUpdateA,
        }),
        SignalDisplay({
          title: 'Signal B',
          value: signalB.get(),
          className: 'bg-success bg-opacity-10',
          onUpdate: handleUpdateB,
        }),
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
