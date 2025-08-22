import { button, component, computed, div, effect, h1, h2, p, render, signal, span } from '../../src/index.js';
import styles from './main.module.css';

// Stopwatch state
const isRunning = signal(false);
const startTime = signal<number | null>(null);
const elapsedTime = signal(0);
const lapTimes = signal<number[]>([]);

// Computed values for time formatting
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

// Timer control functions
const startTimer = () => {
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

// Timer effect - updates elapsed time when running
effect(() => {
  if (isRunning.get()) {
    const interval = setInterval(() => {
      if (startTime.get() !== null) {
        const elapsed = Date.now() - startTime.get()!;
        elapsedTime.set(elapsed);
      }
    }, 10); // Update every 10ms for smooth display

    return () => clearInterval(interval);
  }
});

// Stopwatch component
const stopwatchComponent = component(() => {
  return div(
    { className: styles.stopwatchContainer },

    // Header
    h1('Stopwatch'),
    p({ className: styles.subtitle }, 'A reactive stopwatch built with Tacit-DOM'),

    // Time display - reactive
    div({ className: styles.timeDisplay }, displayTime.get()),

    // Control buttons - reactive states
    div(
      { className: styles.controls },
      button(
        {
          className: styles.startBtn,
          onClick: startTimer,
          disabled: isRunning.get(),
        },
        'Start',
      ),
      button(
        {
          className: styles.stopBtn,
          onClick: stopTimer,
          disabled: !isRunning.get(),
        },
        'Stop',
      ),
      button(
        {
          className: styles.resetBtn,
          onClick: resetTimer,
        },
        'Reset',
      ),
      button(
        {
          className: styles.lapBtn,
          onClick: recordLap,
          disabled: !isRunning.get(),
        },
        'Lap',
      ),
    ),

    // Lap times - fully reactive
    (() => {
      const laps = lapTimes.get();
      if (laps.length === 0) return null;

      return div(
        { className: styles.laps },
        h2('Lap Times'),
        ...formattedLapTimes
          .get()
          .map((lap) =>
            div(
              { className: styles.lapItem },
              span({ className: styles.lapNumber }, `Lap ${lap.number}`),
              span({ className: styles.lapTime }, lap.time),
            ),
          ),
      );
    })(),
  );
});

// Render the stopwatch
render(stopwatchComponent, document.getElementById('app')!);
