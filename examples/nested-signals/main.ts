import { button, component, div, h1, render } from '../../src/index';
import styles from './styles.module.css';

// Counter component that receives initial value as a prop
const Counter = component<{ title: string; initialValue?: number }>((props, utils) => {
  // Each Counter instance has its own local signal using utils.signal
  const count = utils.signal(props.initialValue || 0);

  console.log('count', count.get());

  const increment = () => {
    count.update((prev) => prev + 1);
    console.log(`updated ${props.title} counter:`, count.get());
  };

  const decrement = () => {
    count.update((prev) => prev - 1);
    console.log(`updated ${props.title} counter:`, count.get());
  };

  const reset = () => {
    count.set(props.initialValue || 0);
    console.log(`${props.title} counter reset to:`, count.get());
  };

  return div(
    { className: styles.counter },
    div({ className: styles.header }, h1({ className: styles.title }, props.title)),
    div(
      { className: styles.body },
      div({ className: styles.count }, count.get()),
      div(
        { className: styles.buttons },
        button(
          {
            onClick: decrement,
            className: [styles.btn, styles.btnDecrement],
          },
          '-',
        ),
        button(
          {
            onClick: reset,
            className: [styles.btn, styles.btnReset],
          },
          'Reset',
        ),
        button(
          {
            onClick: increment,
            className: [styles.btn, styles.btnIncrement],
          },
          '+',
        ),
      ),
    ),
  );
});

// Main app component
const app = component((props, utils) => {
  console.log('app renders');

  return div(
    { className: styles.app },
    div(
      { className: styles.container },
      h1({ className: styles.appTitle }, 'Counters with Local Signals'),
      div(
        { className: styles.countersRow },
        Counter({ title: 'Counter A', initialValue: 0 }),
        Counter({ title: 'Counter B', initialValue: 10 }),
      ),
      div(
        { className: styles.footer },
        div(
          { className: styles.infoBox },
          h1({ className: styles.infoTitle }, '🔍 What to observe:'),
          div(
            { className: styles.infoList },
            div({ className: styles.infoItem }, '• Each counter should maintain its own independent state'),
            div({ className: styles.infoItem }, '• Clicking + or - on Counter A should only affect Counter A'),
            div({ className: styles.infoItem }, '• Clicking + or - on Counter B should only affect Counter B'),
            div({ className: styles.infoItem }, '• Check the browser console for state change logs!'),
          ),
        ),
      ),
    ),
  );
});

// Mount the application
render(app, document.getElementById('app')!);
