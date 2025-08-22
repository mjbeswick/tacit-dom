import { computed, effect, signal } from '../../src/index';

// Global signal - accessible from anywhere
export const globalCounter = signal(0);

export const globalCounterComputed = computed(() => globalCounter.get());

effect(() => {
  console.log(`global counter computed : ${globalCounterComputed.get()}`);
});

globalCounterComputed.subscribe(() => {
  console.log(`global counter computed subscribed: ${globalCounterComputed.value}`);
});

export const globalEven = computed(() => (globalCounter.get() % 2 === 0 ? 'even' : 'odd'));

// Simple update function for the global counter
export const incrementGlobal = () => {
  globalCounter.set(globalCounter.get() + 1);
  console.log(`global counter: ${globalCounter.get()}`);
};
// const decramentGlobal = () => {
//   globalCounter.update((prev) => prev - 1);
//   console.log(`global counter: ${globalCounter.get()}`);
// };

// effect(() => {
//   console.log(`effect running: ${globalCounter.get()}`);

//   const timeout = setTimeout(() => {
//     console.log('timeout running');

//     if (globalCounter.get() > 0) {
//       decramentGlobal();
//     }
//   }, 5000);

//   return () => {
//     console.log('clearing timeout');
//     clearTimeout(timeout);
//   };
// });
