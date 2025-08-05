import { signal, computed, div, button, span } from 'reactive-dom';
import styles from './debug.module.css';

// Create the debug app
export const createDebugApp = () => {
  // Simple test
  const counter = signal(0);
  const isDisabled = computed(() => counter.get() >= 5);

  return div(
    { className: styles.test },
    span({ className: styles.counter }, 'Count: ', counter),
    button(
      {
        className: styles.button,
        onClick: () => {
          console.log('Clicking button, current count:', counter.get());
          counter.set(counter.get() + 1);
          console.log('New count:', counter.get());
        },
        disabled: isDisabled,
      },
      'Increment'
    )
  );
};
