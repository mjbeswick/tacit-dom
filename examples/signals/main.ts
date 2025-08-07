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

  const signalD = signal(random());

  const computedB = computed(() => {
    console.log('computed signalB', signalD.get());
    return signalD.get();
  });

  effect(() => {
    console.log('effect signalB', computedB.get());
  });

  return div(
    h1('Domitor Signals Example'),
    div(button({ onclick: handleUpdate }, 'Update signals')),
    div(
      p('signalA: ', signalA),
      p('signalB: ', signalB),
      p('signalC (computed): ', computedA),
      p('signalD: ', signalD),
    ),
  );
};

// Render the app
render(app, document.getElementById('app')!);
