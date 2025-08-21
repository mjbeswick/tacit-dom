import { button, component, div, render, useSignal } from '../../src/index';
import { globalCounter, incrementGlobal } from './store';
import styles from './styles.module.css';

// Main app component
const app = component(() => {
  // Local signal - only accessible within this component
  const localCounter = useSignal(0);

  console.log('localCounter', localCounter.get());

  const incrementLocal = () => {
    localCounter.update((prev) => prev + 1);
    console.log(`local counter: ${localCounter.get()}`);
  };

  return div(
    { classNames: styles.app },
    div(
      { classNames: styles.card },
      div(
        { classNames: styles.cardHeader },
        div({ classNames: styles.title }, 'Simple Signals Demo'),
        div(
          { classNames: styles.subtitle },
          'Global vs Local Signals with Reactive Updates',
        ),
      ),
      div(
        { classNames: styles.cardBody },
        // Global counter display
        div(
          {
            classNames: [styles.counterSection, styles.globalCounter],
          },
          div(
            { classNames: styles.counterHeader },
            div({ classNames: styles.counterLabel }, 'Global Counter'),
            div(
              { classNames: [styles.counterValue, styles.globalValue] },
              globalCounter.get(),
            ),
            button(
              {
                onClick: incrementGlobal,
                classNames: [styles.btn, styles.btnGlobal],
              },
              'Increment Global',
            ),
          ),
        ),
        // Local counter display
        div(
          {
            classNames: [styles.counterSection, styles.localCounter],
          },
          div(
            { classNames: styles.counterHeader },
            div({ classNames: styles.counterLabel }, 'Local Counter'),
            div(
              { classNames: [styles.counterValue, styles.localValue] },
              localCounter.get(),
            ),
            button(
              {
                onClick: incrementLocal,
                classNames: [styles.btn, styles.btnLocal],
              },
              'Increment Local',
            ),
          ),
        ),
        // Info section
        div(
          {
            classNames: [styles.counterSection, styles.infoSection],
          },
          div({ classNames: styles.infoTitle }, 'How it works'),
          div(
            { classNames: styles.infoText },
            'The global counter persists across component re-renders and automatically decrements every second, while the local counter resets each time. ' +
              'Both automatically update the UI when their values change!',
          ),
        ),
      ),
    ),
  );
});

// Mount the application
render(app, document.getElementById('app')!);
