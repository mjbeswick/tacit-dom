import { signal, computed, div, button, span, h1, p } from 'reactive-dom';

export const app = () => {
  // Initialize a counter signal
  const counter = signal(0);

  // Create computed values for button states
  const isIncrementDisabled = computed(() => false);
  const isDecrementDisabled = computed(() => counter.get() <= 0);

  // Create event handlers
  const handleIncrement = () => {
    counter.set(counter.get() + 1);
  };

  const handleDecrement = () => {
    if (counter.get() > 0) {
      counter.set(counter.get() - 1);
    }
  };

  return div(
    { className: 'container' },
    div(
      { className: 'notice' },
      h1('Reactive DOM Counter Example'),
      p(
        'This example demonstrates reactive signals with increment and decrement buttons. The decrement button is disabled when the counter reaches zero.',
      ),
      div(
        { className: 'grid' },
        div(
          { className: 'card' },
          span({ id: 'counter-value', className: 'badge' }, 'Count: ', counter),
          div(
            { className: 'button-group' },
            button(
              {
                id: 'decrement',
                onclick: handleDecrement,
                disabled: isDecrementDisabled,
              },
              'Decrement',
            ),
            button(
              {
                id: 'increment',
                onclick: handleIncrement,
                disabled: isIncrementDisabled,
              },
              'Increment',
            ),
          ),
        ),
      ),
    ),
  );
};

document.getElementById('app')?.appendChild(app());
