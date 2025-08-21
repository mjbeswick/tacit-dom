import { button, component, div, h1, render, signal } from '../../src/index';
import styles from './styles.module.css';

// Counter component with its own local signal
const counter = component((props: { title: string; initialValue?: number }) => {
  console.log('counter renders');
  // Each Counter instance has its own local signal
  const count = signal(props.initialValue || 0);

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
    div(
      { classNames: styles.header },
      h1({ classNames: styles.title }, props.title),
    ),
    div(
      { classNames: styles.body },
      div({ classNames: styles.count }, count.get()),
      div(
        { classNames: styles.buttons },
        button(
          {
            onclick: decrement,
            classNames: [styles.btn, styles.btnDecrement],
          },
          '-',
        ),
        button(
          {
            onclick: reset,
            classNames: [styles.btn, styles.btnReset],
          },
          'Reset',
        ),
        button(
          {
            onclick: increment,
            classNames: [styles.btn, styles.btnIncrement],
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
    { classNames: styles.app },
    div(
      { classNames: styles.container },
      h1({ className: styles.appTitle }, 'Counters with Local Signals'),
      div(
        { className: styles.countersRow },
        counter({ title: 'Counter A', initialValue: 0 }),
        counter({ title: 'Counter B', initialValue: 10 }),
      ),
      div(
        { className: styles.footer },
        div(
          { className: styles.infoBox },
          h1({ className: styles.infoTitle }, '🔍 What to observe:'),
          div(
            { className: styles.infoList },
            div(
              { className: styles.infoItem },
              '• Each counter should maintain its own independent state',
            ),
            div(
              { className: styles.infoItem },
              '• Clicking + or - on Counter A should only affect Counter A',
            ),
            div(
              { className: styles.infoItem },
              '• Clicking + or - on Counter B should only affect Counter B',
            ),
            div(
              { className: styles.infoItem },
              '• Check the browser console for state change logs!',
            ),
          ),
        ),
      ),
    ),
  );
});

// Mount the application
render(app, document.getElementById('app')!);
