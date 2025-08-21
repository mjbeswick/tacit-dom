// Simple test to debug component reactivity
import { component, div, render, signal } from './dist/tacit-dom.esm.js';

console.log('Testing component reactivity...');

// Create a signal outside the component
const externalSignal = signal(0);

// Create a component that uses the signal
const TestComponent = component(() => {
  console.log('Component rendering, signal value:', externalSignal.get());
  return div(`Signal value: ${externalSignal.get()}`);
});

// Render the component
const container = document.createElement('div');
document.body.appendChild(container);

render(TestComponent, container);

console.log('Initial render complete');
console.log('Container content:', container.innerHTML);

// Wait a bit, then update the signal
setTimeout(() => {
  console.log('Updating signal to 42...');
  externalSignal.set(42);

  setTimeout(() => {
    console.log('After signal update');
    console.log('Container content:', container.innerHTML);
  }, 100);
}, 100);
