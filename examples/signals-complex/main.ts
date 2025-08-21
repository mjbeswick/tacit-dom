import { button, component, div, render, signal } from '../../src/index';
import {
  computedC,
  counterA,
  counterB,
  updateA,
  updateB,
  updateBAsync,
} from './store';
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
      classNames: [styles.btn, props?.className || ''],
      disabled: props?.loading,
    },
    div(
      {
        classNames: styles.btnContent,
      },
      props?.loading ? 'Loading...' : props?.children || 'Button',
    ),
    ...(props?.loading
      ? [
          div(
            {
              classNames: styles.spinner,
            },
            div({
              classNames: styles.spinnerInner,
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
    { classNames: [styles.counterDisplay, props?.className || ''] },
    div({ classNames: styles.counterTitle }, props?.title || 'Counter'),
    div({ classNames: styles.counterValue }, props?.value || 0),
  );
});

// Display computed value
const ComputedDisplay = component(() => {
  const status = computedC.get();

  return div(
    { classNames: styles.computedDisplay },
    div(
      { classNames: styles.computedHeader },
      div({ classNames: styles.computedTitle }, 'Combined Display'),
      div({ classNames: styles.badge }, status.total + ' Total'),
    ),
    div(
      { classNames: styles.computedGrid },
      div(
        { classNames: styles.computedItem },
        div(
          { classNames: styles.computedItem },
          div(
            { classNames: [styles.computedPercentage, styles.percentageA] },
            status.percentageA + '%',
          ),
          div({ classNames: styles.computedLabel }, 'Counter A'),
        ),
      ),
      div(
        { classNames: styles.computedItem },
        div(
          { classNames: styles.computedItem },
          div(
            { classNames: [styles.computedPercentage, styles.percentageB] },
            status.percentageB + '%',
          ),
          div({ classNames: styles.computedLabel }, 'Counter B'),
        ),
      ),
    ),
    div(
      { classNames: styles.computedSummary },
      div({ classNames: styles.summaryTitle }, status.summary),
      div({ classNames: styles.summaryScore }, status.score),
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
      classNames: styles.app,
    },
    div(
      { classNames: styles.card },
      div(
        { classNames: styles.cardHeader },
        div({ classNames: styles.title }, 'Reactive Counter Demo'),
        div(
          { classNames: styles.subtitle },
          'Watch how counters automatically update the UI in real-time!',
        ),
      ),
      div(
        { classNames: styles.cardBody },
        CounterDisplay({
          title: 'Counter A',
          value: counterA.get(),
          className: styles.counterSuccess,
        }),
        CounterDisplay({
          title: 'Counter B',
          value: counterB.get(),
          className: styles.counterInfo,
        }),
        CounterDisplay({
          title: 'Local Counter',
          value: localCounter.get(),
          className: styles.counterWarning,
        }),
        ComputedDisplay(),
        div(
          { classNames: styles.buttonGrid },
          div(
            { classNames: styles.buttonGrid },
            Button({
              onclick: updateA,
              className: styles.btnSuccess,
              children: 'Update Counter A',
            }),
          ),
          div(
            { classNames: styles.buttonGrid },
            Button({
              onclick: updateB,
              className: styles.btnInfo,
              children: 'Update Counter B',
            }),
          ),
          div(
            { classNames: styles.buttonGrid },
            Button({
              onclick: updateBAsync,
              className: styles.btnWarning,
              loading: counterB.pending,
              children: 'Update B Async',
            }),
          ),
          div(
            { classNames: styles.buttonGrid },
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
