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
    { classNames: styles.counter },
    div({ classNames: styles.header }, h1({ classNames: styles.title }, props.title)),
    div(
      { classNames: styles.body },
      div({ classNames: styles.count }, count.get()),
      div(
        { classNames: styles.buttons },
        button(
          {
            onClick: decrement,
            classNames: [styles.btn, styles.btnDecrement],
          },
          '-',
        ),
        button(
          {
            onClick: reset,
            classNames: [styles.btn, styles.btnReset],
          },
          'Reset',
        ),
        button(
          {
            onClick: increment,
            classNames: [styles.btn, styles.btnIncrement],
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
    { classNames: styles.app },
    div(
      { classNames: styles.container },
      h1({ classNames: styles.appTitle }, 'Counters with Local Signals'),
      div(
        { classNames: styles.countersRow },
        Counter({ title: 'Counter A', initialValue: 0 }),
        Counter({ title: 'Counter B', initialValue: 10 }),
      ),
      div(
        { classNames: styles.footer },
        div(
          { classNames: styles.infoBox },
          h1({ classNames: styles.infoTitle }, '🔍 What to observe:'),
          div(
            { classNames: styles.infoList },
            div({ classNames: styles.infoItem }, '• Each counter should maintain its own independent state'),
            div({ classNames: styles.infoItem }, '• Clicking + or - on Counter A should only affect Counter A'),
            div({ classNames: styles.infoItem }, '• Clicking + or - on Counter B should only affect Counter B'),
            div({ classNames: styles.infoItem }, '• Check the browser console for state change logs!'),
          ),
        ),
      ),
    ),
  );
});

// Mount the application
render(app, document.getElementById('app')!);
