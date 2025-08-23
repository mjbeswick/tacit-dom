import { button, component, div, render } from '../../src/index';
import { globalCounterComputed, globalEven, incrementGlobal } from './store';
import styles from './styles.module.css';

//  is a proxy to the global counter

// Main app component
const app = component((_props, { signal, computed, effect }) => {
  // Local signal - only accessible within this component
  const localCounter = signal(0);

  // Computed value that depends on the local counter
  const doubledCounter = computed(() => localCounter.get() * 2);

  // Effect that logs when the counter changes
  effect(() => {
    console.log(`Counter changed to: ${localCounter.get()}`);
    console.log(`Doubled value: ${doubledCounter.get()}`);
  });

  const incrementLocal = () => {
    localCounter.update((prev) => prev + 1);
    console.log(`local counter: ${localCounter.get()}`);
  };

  return div(
    { className: styles.app },
    div(
      { className: styles.card },
      div(
        { className: styles.cardHeader },
        div({ className: styles.title }, 'Simple Signals Demo'),
        div({ className: styles.subtitle }, 'Global vs Local Signals with Reactive Updates'),
      ),
      div(
        { className: styles.cardBody },
        // Global counter display
        div(
          { className: [styles.counterSection, styles.globalCounter] },
          div(
            { className: styles.counterHeader },
            div({ className: styles.counterLabel }, 'Global Counter'),
            div({ className: [styles.counterValue, styles.globalValue] }, globalCounterComputed.get()),
            button(
              {
                onClick: incrementGlobal,
                className: [styles.btn, styles.btnGlobal],
              },
              'Increment Global',
            ),
          ),
        ),
        // Local counter display
        div(
          { className: [styles.counterSection, styles.localCounter] },
          div(
            { className: styles.counterHeader },
            div({ className: styles.counterLabel }, 'Local Counter'),
            div({ className: [styles.counterValue, styles.localValue] }, localCounter),
            button(
              {
                onClick: incrementLocal,
                className: [styles.btn, styles.btnLocal],
              },
              'Increment Local',
            ),
          ),
        ),
        // Doubled counter display
        div(
          { className: [styles.counterSection, styles.localCounter] },
          div(
            { className: styles.counterHeader },
            div({ className: styles.counterLabel }, 'Doubled Counter'),
            div({ className: [styles.counterValue, styles.localValue] }, doubledCounter),
          ),
        ),
        // Global even counter display
        div(
          { className: [styles.counterSection, styles.globalCounter] },
          div(
            { className: styles.counterHeader },
            div({ className: styles.counterLabel }, 'Global Even Counter'),
            div({ className: [styles.counterValue, styles.globalValue] }, globalEven),
          ),
        ),
        // Info section
        div(
          { className: [styles.counterSection, styles.infoSection] },
          div({ className: styles.infoTitle }, 'How it works'),
          div(
            { className: styles.infoText },
            'The global counter persists across component re-renders and automatically decrements every second, while the local counter resets each time. ' +
              'Both automatically update the UI when their values change! The doubled counter is computed from the local counter.',
          ),
        ),
      ),
    ),
  );
});

// Mount the application
render(app, document.getElementById('app')!);
