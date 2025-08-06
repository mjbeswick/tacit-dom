import { signal, computed, div, button, span, h1, p } from 'reactive-dom';

// Create the debug app
export const createDebugApp = () => {
  // Simple test
  const counter = signal(0);
  const isDisabled = computed(() => counter.get() >= 5);

  return div(
    { className: 'container' },
    div(
      { className: 'notice' },
      h1('Reactive DOM Debug Example'),
      p(
        'This example demonstrates reactive signals with debugging. Check the console to see the reactive updates in action.',
      ),
      div(
        { className: 'grid' },
        div(
          { className: 'card' },
          span(
            { className: 'badge' },
            'Count: ',
            counter,
          ),
          button(
            {
              className: 'button',
              onclick: () => {
                console.log('Clicking button, current count:', counter.get());
                counter.set(counter.get() + 1);
                console.log('New count:', counter.get());
              },
              disabled: isDisabled,
            },
            'Increment',
          ),
        ),
      ),
    ),
  );
};

document.getElementById('app')?.appendChild(createDebugApp());
