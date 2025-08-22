import { button, component, div, render, signal } from '../../src/index';
import { computedC, counterA, counterB, updateA, updateB, updateBAsync } from './store';
import styles from './styles.module.css';

// Button component with loading state
const Button = component<{
  onclick: () => void;
  className?: string;
  loading?: boolean;
  children: string;
}>((props) => {
  return button(
    {
      onClick: props?.onclick,
      className: [styles.btn, props?.className || ''],
      disabled: props?.loading,
    },
    div(
      {
        className: styles.btnContent,
      },
      props?.loading ? 'Loading...' : props?.children || 'Button',
    ),
    ...(props?.loading
      ? [
          div(
            {
              className: styles.spinner,
            },
            div({
              className: styles.spinnerInner,
            }),
          ),
        ]
      : []),
  );
});

// Display component for counter values
const CounterDisplay = component<{
  title: string;
  value: number;
  className?: string;
}>((props) => {
  return div(
    { className: [styles.counterDisplay, props?.className || ''] },
    div({ className: styles.counterTitle }, props?.title || 'Counter'),
    div({ className: styles.counterValue }, props?.value || 0),
  );
});

// Display computed value
const ComputedDisplay = component(() => {
  const status = computedC.get();

  return div(
    { className: styles.computedDisplay },
    div(
      { className: styles.computedHeader },
      div({ className: styles.computedTitle }, 'Combined Display'),
      div({ className: styles.badge }, status.total + ' Total'),
    ),
    div(
      { className: styles.computedGrid },
      div(
        { className: styles.computedItem },
        div(
          { className: styles.computedItem },
          div({ className: [styles.computedPercentage, styles.percentageA] }, status.percentageA + '%'),
          div({ className: styles.computedLabel }, 'Counter A'),
        ),
      ),
      div(
        { className: styles.computedItem },
        div(
          { className: styles.computedItem },
          div({ className: [styles.computedPercentage, styles.percentageB] }, status.percentageB + '%'),
          div({ className: styles.computedLabel }, 'Counter B'),
        ),
      ),
    ),
    div(
      { className: styles.computedSummary },
      div({ className: styles.summaryTitle }, status.summary),
      div({ className: styles.summaryScore }, status.score),
    ),
  );
});

// Main app component
const app = component(() => {
  // Local counter for component-scoped state
  const localCounter = signal(0);

  const incrementLocal = () => {
    localCounter.update((prev) => prev + 1);
    console.log(`local counter: ${localCounter.get()}`);
  };

  console.log(`app renders: ${counterA.get()} ${counterB.get()}`);

  return div(
    {
      className: styles.app,
    },
    div(
      { className: styles.card },
      div(
        { className: styles.cardHeader },
        div({ className: styles.title }, 'Reactive Counter Demo'),
        div({ className: styles.subtitle }, 'Watch how counters automatically update the UI in real-time!'),
      ),
      div(
        { className: styles.cardBody },
        CounterDisplay({
          title: 'Counter A',
          value: counterA.get(),
          className: styles.counterSuccess,
        }),
        CounterDisplay({
          title: 'Counter B',
          value: counterB.get(),
          className: styles.btnInfo,
        }),
        CounterDisplay({
          title: 'Local Counter',
          value: localCounter.get(),
          className: styles.counterWarning,
        }),
        ComputedDisplay(),
        div(
          { className: styles.buttonGrid },
          div(
            { className: styles.buttonGrid },
            Button({
              onclick: updateA,
              className: styles.btnSuccess,
              children: 'Update Counter A',
            }),
          ),
          div(
            { className: styles.buttonGrid },
            Button({
              onclick: updateB,
              className: styles.btnInfo,
              children: 'Update Counter B',
            }),
          ),
          div(
            { className: styles.buttonGrid },
            Button({
              onclick: updateBAsync,
              className: styles.btnWarning,
              loading: counterB.pending,
              children: 'Update B Async',
            }),
          ),
          div(
            { className: styles.buttonGrid },
            Button({
              onclick: incrementLocal,
              className: styles.btnSecondary,
              children: 'Update Local',
            }),
          ),
        ),
      ),
    ),
  );
});

// Mount the application
render(app, document.getElementById('app')!);
