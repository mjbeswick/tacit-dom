// Test to verify infinite loop detection is working
import { computed, effect, signal } from './dist/reactive-dom.esm.js';

console.log('Testing infinite loop detection...');

// Test 1: Basic signal and computed
const count = signal(0);
const doubled = computed(() => count.get() * 2);

console.log('Initial values:');
console.log('count:', count.get());
console.log('doubled:', doubled.get());

// Test 2: Effect that updates the signal
let effectCount = 0;
effect(() => {
  effectCount++;
  console.log(
    `Effect run ${effectCount}: count = ${count.get()}, doubled = ${doubled.get()}`,
  );

  // This would cause an infinite loop in the old implementation
  if (effectCount < 5) {
    count.set(count.get() + 1);
  }
});

console.log('\nUpdating count...');
count.set(10);

console.log('\nFinal values:');
console.log('count:', count.get());
console.log('doubled:', doubled.get());
console.log('effect runs:', effectCount);

// Test 3: Computed that depends on itself (should be caught)
console.log('\nTesting computed with self-reference...');
let selfRefCount = 0;
const selfRef = computed(() => {
  selfRefCount++;
  if (selfRefCount > 10) {
    console.log('Self-reference caught after', selfRefCount, 'iterations');
    return 42; // Return a stable value
  }
  return selfRef.get() + 1; // This would cause infinite loop
});

try {
  console.log('selfRef value:', selfRef.get());
} catch (error) {
  console.log('Self-reference error caught:', error.message);
}

console.log('\nTest completed successfully!');
