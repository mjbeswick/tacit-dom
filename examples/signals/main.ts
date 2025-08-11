import {
  button,
  computed,
  div,
  effect,
  h1,
  p,
  render,
  signal,
} from '../../src/index';

const random = () => Math.random().toString(36).slice(2, 6).toUpperCase();

const signalA = signal(random());
const signalB = signal(random());

const computedA = computed(() => {
  console.log('computed signalC');
  return signalA.get() + ' ' + signalB.get();
});

effect(() => {
  console.log('effect signalA', computedA.get());
});

// Add effect to log when signalA or signalB changes
effect(() => {
  console.log(`Signals updated - signalA: ${signalA}, signalB: ${signalB}`);
});

const app = () => {
  console.log(`app renders: ${signalA} ${signalB}`);

  const handleUpdate = () => {
    signalA.set(random());
    signalB.set(random());
    // Trigger a re-render to see the app function console.log
    render(app, document.getElementById('app')!);
  };

  // Use signal with key for preserved state between renders
  const signalD = signal(random(), 'signalD');

  // Regular signal without key - will be recreated on each render
  const regularSignal = signal(random());

  const computedB = computed(() => {
    console.log('computed signalB', signalD.get());
    return signalD.get();
  });

  effect(() => {
    console.log('effect signalB', computedB.get());
  });

  const handleReRender = () => {
    // Force a re-render by calling render again
    render(app, document.getElementById('app')!);
  };

  return div(
    h1('Thorix Signals Example'),
    div(
      button({ onclick: handleUpdate }, 'Update signals'),
      button(
        { onclick: handleReRender },
        'Re-render (notice preserved signals maintain state)',
      ),
    ),
    div(
      p(`signalA: ${signalA.get()}`),
      p(`signalB: ${signalB.get()}`),
      p(`signalC (computed): ${computedA.get()}`),
      p(`signalD (preserved): ${signalD.get()}`),
      p('regularSignal (recreated each render): ', regularSignal),
      p('Note: signals with keys maintain their values between renders!'),
      // Demonstrate toString functionality
      p(`Direct signal usage: ${signalA}`),
      p(`Direct computed usage: ${computedA}`),
      p(
        `String concatenation: Count is ${signalA.get()}, doubled is ${computedA}`,
      ),
    ),
  );
};

// Render the app
render(app, document.getElementById('app')!);
