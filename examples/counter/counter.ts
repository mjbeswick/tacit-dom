import { signal, computed, div, button, span, h1, p } from 'reactive-dom';
import styles from './counter.module.css';

// Create the counter app
export const createCounterApp = () => {
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
    div(
      { className: styles.container },
      div(
        { className: styles.exampleSection },
        h1({ className: styles.title }, 'Reactive DOM Counter Example'),
        p(
          { className: styles.description },
          'This example demonstrates reactive signals with increment and decrement buttons. The decrement button is disabled when the counter reaches zero.'
        ),
        div(
          { id: 'counter-example' },
          div(
            { className: styles.counter },
            button(
              {
                id: 'decrement',
                className: `${styles.counterButton} ${styles.decrementButton}`,
                onClick: handleDecrement,
                disabled: isDecrementDisabled,
              },
              'Decrement'
            ),
            span(
              { id: 'counter-value', className: styles.counterValue },
              'Count: ',
              counter
            ),
            button(
              {
                id: 'increment',
                className: `${styles.counterButton} ${styles.incrementButton}`,
                onClick: handleIncrement,
                disabled: isIncrementDisabled,
              },
              'Increment'
            )
          )
        )
      )
    )
  );
};
