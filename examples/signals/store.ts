import { signal } from '../../src/index';

// Global signal - accessible from anywhere
export const globalCounter = signal(0);

// Simple update function for the global counter
export const incrementGlobal = () => {
  globalCounter.set(globalCounter.get() + 1);
  console.log(`global counter: ${globalCounter.get()}`);
};
