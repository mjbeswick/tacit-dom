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

const app = () => {
  const handleUpdate = () => {
    signalA.set(random());
    signalB.set(random());
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
    h1('Domitor Signals Example'),
    div(
      button({ onclick: handleUpdate }, 'Update signals'),
      button(
        { onclick: handleReRender },
        'Re-render (notice preserved signals maintain state)',
      ),
    ),
    div(
      p('signalA: ', signalA),
      p('signalB: ', signalB),
      p('signalC (computed): ', computedA),
      p('signalD (preserved): ', signalD),
      p('regularSignal (recreated each render): ', regularSignal),
      p('Note: signals with keys maintain their values between renders!'),
    ),
  );
};

// Render the app
render(app, document.getElementById('app')!);
