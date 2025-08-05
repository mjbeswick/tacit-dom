// Import reactive-dom functions
import { signal, computed, div, button, span, h1, p } from '../src/index.js';
// Import CSS module
import styles from './app.module.css';

// Create the main app structure
const app = () => {
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
    div(
      { className: styles.container },
      div(
        { className: styles.exampleSection },
        h1({ className: styles.title }, 'Reactive DOM Random Number Generator'),
        p(
          { className: styles.description },
          'This example demonstrates reactive signals with a button that generates random numbers. Click the button to see the value update automatically.'
        ),
        div(
          { id: 'random-example' },
          div(
            { className: styles.counter },
            button(
              {
                id: 'generate-random',
                className: `${styles.counterButton} ${styles.incrementButton}`,
                onClick: handleGenerateRandom,
                disabled: isGenerateDisabled,
              },
              'Generate Random Number'
            ),
            span(
              { id: 'random-value', className: styles.counterValue },
              'Random Number: ',
              randomNumber
            )
          )
        )
      )
    )
  );
};

// Create the app component once
const appComponent = app();

// Render the app
document.body.appendChild(appComponent);
