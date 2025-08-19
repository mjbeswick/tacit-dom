import { computed, effect, signal } from '../../src/signals';

export const signalA = signal(0);
export const signalB = signal(0);

export const computedC = computed(() => {
  console.log('computed signalC');
  return signalA.get() + ' / ' + signalB.get();
});

effect(() => {
  console.log('effect signalA', computedC.get());
});

effect(() => {
  console.log(
    `Signals updated - signalA: ${signalA.get()}, signalB: ${signalB.get()}`,
  );
});

export const updateA = () => {
  signalA.set(signalA.get() + 1);
};

export const updateB = () => {
  signalB.update((value) => value + 1);
};

export const updateBAsync = async () => {
  await signalB.update(async (value) => {
    // Simulate some async operation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return value + 1;
  });
};

export const getSignalBStatus = () => {
  return {
    value: signalB.get(),
    pending: signalB.pending,
  };
};
