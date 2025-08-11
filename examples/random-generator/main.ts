import { button, computed, div, h1, h2, p, render, signal, span } from 'thorix';

// Create the random generator app
export const createRandomGeneratorApp = () => {
  // Initialize signals
  const randomNumber = signal(0);
  const count = signal(0);
  const name = signal('World');

  // Create computed values
  const isGenerateDisabled = computed(() => false);
  const doubled = computed(() => count.get() * 2);
  const greeting = computed(() => `Hello, ${name.get()}!`);

  // Create event handlers
  const handleGenerateRandom = () => {
    const newRandomNumber = Math.floor(Math.random() * 100) + 1;
    randomNumber.set(newRandomNumber);
  };

  const handleIncrement = () => {
    count.set(count.get() + 1);
  };

  const handleNameChange = () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    name.set(randomName);
  };

  return div(
    { className: 'container' },
    div(
      { className: 'notice' },
      h1('Thorix Template String Examples'),
      p(
        'This example demonstrates different ways to use reactive signals with template strings and direct signal passing.',
      ),
      div(
        { className: 'grid' },
        div(
          { className: 'card' },
          h2('Random Number Generator'),
          button(
            {
              id: 'generate-random',
              onclick: handleGenerateRandom,
              disabled: isGenerateDisabled,
            },
            'Generate Random Number',
          ),
          // Method 1: Plain template literal with signal interpolation
          span(
            { id: 'random-value-1', className: 'badge' },
            `Random Number: ${randomNumber}`,
          ),
          // Method 2: Passing signal directly as child
          span(
            { id: 'random-value-2', className: 'badge' },
            'Random Number: ',
            randomNumber,
          ),
        ),
        div(
          { className: 'card' },
          h2('Counter with Computed Values'),
          button(
            {
              id: 'increment',
              onclick: handleIncrement,
            },
            'Increment',
          ),
          span(
            { id: 'count-value', className: 'badge' },
            `Count: ${count}, Doubled: ${doubled}`,
          ),
        ),
        div(
          { className: 'card' },
          h2('Dynamic Greeting'),
          button(
            {
              id: 'change-name',
              onclick: handleNameChange,
            },
            'Change Name',
          ),
          span(
            { id: 'greeting', className: 'badge' },
            `${greeting} (Count: ${count})`,
          ),
        ),
      ),
    ),
  );
};

// Use render function instead of direct DOM manipulation
const appContainer = document.getElementById('app');

if (appContainer) {
  render(createRandomGeneratorApp, appContainer);
}
