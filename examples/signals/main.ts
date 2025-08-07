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

const signalC = computed(() => {
  console.log('computed signalC');
  return signalA.get() + ' ' + signalB.get();
});

effect(() => {
  console.log('effect signalC', signalC.get());
});

const app = () => {
  const handleUpdate = () => {
    signalA.set(random());
    signalB.set(random());
  };

  return div(
    h1('Domitor Signals Example'),
    div(button({ onclick: handleUpdate }, 'Update signals')),
    div(
      p('signalA: ', signalA),
      p('signalB: ', signalB),
      p('signalC (computed): ', signalC),
    ),
  );
};

// Render the app
render(app, document.getElementById('app')!);
