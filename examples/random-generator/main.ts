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
    { className: 'min-vh-100 d-flex flex-column' },

    // Header section
    div(
      { className: 'bg-success text-white py-5 flex-shrink-0' },
      div(
        { className: 'container' },
        div(
          { className: 'row justify-content-center' },
          div(
            { className: 'col-lg-8 text-center' },
            h1(
              { className: 'display-4 mb-3' },
              'Thorix Template String Examples',
            ),
            p(
              { className: 'lead mb-0' },
              'This example demonstrates different ways to use reactive signals with template strings and direct signal passing.',
            ),
          ),
        ),
      ),
    ),

    // Main content - flexible and growing
    div(
      { className: 'container flex-grow-1 py-4' },
      div(
        { className: 'row g-4' },
        div(
          { className: 'col-lg-4 col-md-6' },
          div(
            { className: 'card shadow-sm h-100' },
            div(
              { className: 'card-body d-flex flex-column' },
              h2(
                { className: 'card-title h4 mb-3' },
                'Random Number Generator',
              ),
              div(
                { className: 'flex-grow-1' },
                button(
                  {
                    id: 'generate-random',
                    onclick: handleGenerateRandom,
                    disabled: isGenerateDisabled,
                    className: 'btn btn-primary w-100 mb-3',
                  },
                  'Generate Random Number',
                ),
                // Method 1: Plain template literal with signal interpolation
                div(
                  { className: 'p-3 bg-light rounded mb-2' },
                  span(
                    { id: 'random-value-1', className: 'badge bg-primary' },
                    `Random Number: ${randomNumber}`,
                  ),
                ),
                // Method 2: Passing signal directly as child
                div(
                  { className: 'p-3 bg-light rounded' },
                  span(
                    { id: 'random-value-2', className: 'badge bg-secondary' },
                    'Random Number: ',
                    randomNumber,
                  ),
                ),
              ),
            ),
          ),
        ),
        div(
          { className: 'col-lg-4 col-md-6' },
          div(
            { className: 'card shadow-sm h-100' },
            div(
              { className: 'card-body d-flex flex-column' },
              h2(
                { className: 'card-title h4 mb-3' },
                'Counter with Computed Values',
              ),
              div(
                { className: 'flex-grow-1' },
                button(
                  {
                    id: 'increment',
                    onclick: handleIncrement,
                    className: 'btn btn-success w-100 mb-3',
                  },
                  'Increment',
                ),
                div(
                  { className: 'p-3 bg-light rounded' },
                  span(
                    { id: 'count-value', className: 'badge bg-info' },
                    `Count: ${count}, Doubled: ${doubled}`,
                  ),
                ),
              ),
            ),
          ),
        ),
        div(
          { className: 'col-lg-4 col-md-6' },
          div(
            { className: 'card shadow-sm h-100' },
            div(
              { className: 'card-body d-flex flex-column' },
              h2({ className: 'card-title h4 mb-3' }, 'Dynamic Greeting'),
              div(
                { className: 'flex-grow-1' },
                button(
                  {
                    id: 'change-name',
                    onclick: handleNameChange,
                    className: 'btn btn-warning w-100 mb-3',
                  },
                  'Change Name',
                ),
                div(
                  { className: 'p-3 bg-light rounded' },
                  span(
                    { id: 'greeting', className: 'badge bg-warning text-dark' },
                    `${greeting} (Count: ${count})`,
                  ),
                ),
              ),
            ),
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
