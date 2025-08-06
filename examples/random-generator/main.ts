import { signal, computed, div, button, span, h1, p } from 'reactive-dom';

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
      { className: 'example-section' },
      h1('Reactive DOM Random Number Generator'),
      p(
        'This example demonstrates reactive signals with a button that generates random numbers. Click the button to see the value update automatically.',
      ),
      div(
        { id: 'random-example' },
        div(
          { className: 'counter' },
          button(
            {
              id: 'generate-random',
              className: 'button',
              onClick: handleGenerateRandom,
              disabled: isGenerateDisabled,
            },
            'Generate Random Number',
          ),
          span(
            { id: 'random-value', className: 'counter-value' },
            'Random Number: ',
            randomNumber,
          ),
        ),
      ),
    ),
  );
};

document.getElementById('app')?.appendChild(createRandomGeneratorApp());
