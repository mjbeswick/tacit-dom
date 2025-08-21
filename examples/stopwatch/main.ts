import {
  button,
  component,
  computed,
  div,
  effect,
  h1,
  p,
  render,
  signal,
  span,
} from '../../src/index.js';
import styles from './main.module.css';

// Stopwatch state
const isRunning = signal(false);
const startTime = signal<number | null>(null);
const elapsedTime = signal(0);
const lapTimes = signal<number[]>([]);

// Computed values
const displayTime = computed(() => {
  const totalMs = elapsedTime.get();
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = Math.floor((totalMs % 1000) / 10);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
});

const formattedLapTimes = computed(() => {
  return lapTimes.get().map((lapTime, index) => {
    const totalMs = lapTime;
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const milliseconds = Math.floor((totalMs % 1000) / 10);

    return {
      number: index + 1,
      time: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`,
    };
  });
});

// Timer logic

const startTimer = () => {
  console.log('startTimer');
  if (!isRunning.get()) {
    isRunning.set(true);
    startTime.set(Date.now() - elapsedTime.get());
  }
};

const stopTimer = () => {
  if (isRunning.get()) {
    isRunning.set(false);
  }
};

const resetTimer = () => {
  stopTimer();
  elapsedTime.set(0);
  startTime.set(null);
  lapTimes.set([]);
};

const recordLap = () => {
  if (isRunning.get()) {
    const currentLapTime = elapsedTime.get();
    lapTimes.set([...lapTimes.get(), currentLapTime]);
  }
};

effect(() => {
  console.log('effect running', isRunning.get());
  if (isRunning.get()) {
    const elapsed = Date.now() - startTime.get()!;

    elapsedTime.set(elapsed);
  }
});

// Stopwatch component
const stopwatchComponent = component(() => {
  return div(
    { classNames: styles.stopwatchContainer },
    h1('Stopwatch'),
    p(
      { classNames: styles.subtitle },
      'A reactive stopwatch built with Tacit-DOM',
    ),

    // Time display
    div({ classNames: styles.timeDisplay }, displayTime),

    // Control buttons
    div(
      { classNames: styles.controls },
      button(
        {
          classNames: styles.startBtn,
          onClick: startTimer,
          disabled: isRunning.get(),
        },
        'Start',
      ),
      button(
        {
          classNames: styles.stopBtn,
          onClick: stopTimer,
          disabled: !isRunning.get(),
        },
        'Stop',
      ),
      button(
        {
          classNames: styles.resetBtn,
          onClick: resetTimer,
        },
        'Reset',
      ),
      button(
        {
          classNames: styles.lapBtn,
          onClick: recordLap,
          disabled: !isRunning.get(),
        },
        'Lap',
      ),
    ),

    // Lap times
    lapTimes.get().length > 0
      ? div(
          { classNames: styles.laps },
          ...formattedLapTimes
            .get()
            .map((lap) =>
              div(
                { classNames: styles.lapItem },
                span({ classNames: styles.lapNumber }, `Lap ${lap.number}`),
                span({ classNames: styles.lapTime }, lap.time),
              ),
            ),
        )
      : null,
  );
});

// Render the stopwatch
render(stopwatchComponent, document.getElementById('app')!);
