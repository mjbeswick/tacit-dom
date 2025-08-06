import { signal, computed, div, button, span } from 'reactive-dom';

// Create the debug app
export const createDebugApp = () => {
  // Simple test
  const counter = signal(0);
  const isDisabled = computed(() => counter.get() >= 5);

  return div(
    { className: 'container' },
    div(
      { className: 'example-section' },
      span({ className: 'counter-value' }, 'Count: ', counter),
      button(
        {
          className: 'button',
          onClick: () => {
            console.log('Clicking button, current count:', counter.get());
            counter.set(counter.get() + 1);
            console.log('New count:', counter.get());
          },
          disabled: isDisabled,
        },
        'Increment',
      ),
    ),
  );
};

document.getElementById('app')?.appendChild(createDebugApp());
