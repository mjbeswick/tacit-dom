import { computed, effect, signal } from '../../src/index';

// Create reactive counters
export const counterA = signal(0);
export const counterB = signal(0);

// Computed value that combines both counters
export const computedC = computed(() => {
  const valueA = counterA.get();
  const valueB = counterB.get();
  const total = valueA + valueB;
  const percentageA = total > 0 ? Math.round((valueA / total) * 100) : 0;
  const percentageB = total > 0 ? Math.round((valueB / total) * 100) : 0;

  let leader = 'Equal';
  if (valueA > valueB) leader = 'Counter A';
  else if (valueB > valueA) leader = 'Counter B';

  return {
    total,
    percentageA,
    percentageB,
    leader,
    score: `${valueA} - ${valueB}`,
    summary: `${leader} ${leader === 'Equal' ? 'are equal' : 'is leading'} (${percentageA}% - ${percentageB}%)`,
  };
});

// Log computed value changes
effect(() => {
  const status = computedC.get();
  console.log('Computed updated:', status.summary);
});

// Log counter changes
effect(() => {
  console.log(`Counters: A=${counterA.get()}, B=${counterB.get()}`);
});

// Update functions
export const updateA = () => counterA.set(counterA.get() + 1);
export const updateB = () => counterB.update((value: number) => value + 1);

export const updateBAsync = async () => {
  await counterB.update(async (value: number) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return value + 1;
  });
};

export const getCounterBStatus = () => ({
  value: counterB.get(),
  pending: counterB.pending,
});
