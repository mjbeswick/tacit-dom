import { computed, effect, signal } from '../../src/index';

// Global signal - accessible from anywhere
export const globalCounter = signal(0);

export const globalEven = computed(() => (globalCounter.get() % 2 === 0 ? 'even' : 'odd'));

// Simple update function for the global counter
export const incrementGlobal = () => {
  globalCounter.set(globalCounter.get() + 1);
  console.log(`global counter: ${globalCounter.get()}`);
};

const decramentGlobal = () => {
  globalCounter.set(globalCounter.get() - 1);
  console.log(`global counter: ${globalCounter.get()}`);
};

effect(() => {
  console.log(`effect running: ${globalCounter.get()}`);

  const timeout = setTimeout(() => {
    console.log('timeout running');

    if (globalCounter.get() > 0) {
      decramentGlobal();
    }
  }, 5000);

  return () => {
    console.log('clearing timeout');
    clearTimeout(timeout);
  };
});
