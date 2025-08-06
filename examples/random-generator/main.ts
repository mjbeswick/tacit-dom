import { signal, computed, div, button, span, h1, p } from 'sigdom';

// Create the random generator app
export const createRandomGeneratorApp = () => {
  // Initialize a random number signal
  const randomNumber = signal(0);

  // Create computed values for button states
  const isGenerateDisabled = computed(() => false); // Always enabled for this example

  // Create event handlers
  const handleGenerateRandom = () => {
    const newRandomNumber = Math.floor(Math.random() * 100) + 1; // Generate number between 1-100
    randomNumber.set(newRandomNumber);
  };

  return div(
    { className: 'container' },
    div(
      { className: 'notice' },
      h1('SigDOM Random Number Generator'),
      p(
        'This example demonstrates reactive signals with a button that generates random numbers. Click the button to see the value update automatically.',
      ),
      div(
        { className: 'grid' },
        div(
          { className: 'card' },
          button(
            {
              id: 'generate-random',
              onclick: handleGenerateRandom,
              disabled: isGenerateDisabled,
            },
            'Generate Random Number',
          ),
          span(
            { id: 'random-value', className: 'badge' },
            'Random Number: ',
            randomNumber,
          ),
        ),
      ),
    ),
  );
};

document.getElementById('app')?.appendChild(createRandomGeneratorApp());
