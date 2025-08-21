import {
  button,
  component,
  computed,
  div,
  effect,
  h3,
  p,
  render,
  signal,
  span,
} from '../../src/index';

// Example 1: Component that might throw an error
const RiskyComponent = component(() => {
  const shouldThrow = signal(false);
  const errorMessage = signal<string | null>(null);

  // Separate the computation from side effects
  const result = computed(() => {
    if (shouldThrow.get()) {
      return 'Error occurred during operation';
    }
    return 'Operation completed successfully!';
  });

  // Create reactive button text and class
  const buttonText = computed(() =>
    shouldThrow.get() ? 'Disable Error' : 'Enable Error',
  );
  const buttonClass = computed(() => (shouldThrow.get() ? 'danger' : ''));

  // Handle the risky operation separately
  const runRiskyOperation = () => {
    try {
      if (shouldThrow.get()) {
        throw new Error('This is a simulated error from the risky component!');
      }
      errorMessage.set(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      errorMessage.set(message);
    }
  };

  const handleToggleShouldThrow = () => {
    shouldThrow.update((x) => !x);
  };

  effect(() => {
    console.log('shouldThrow changed to:', shouldThrow.get());
  });

  return div(
    { className: 'component' },
    h3('Risky Component'),
    p('This component demonstrates error handling with try/catch.'),
    button(
      {
        onclick: handleToggleShouldThrow,
        className: buttonClass.get(),
      },
      buttonText.get(),
    ),
    button(
      {
        onclick: runRiskyOperation,
      },
      'Run Risky Operation',
    ),
    div(
      { className: errorMessage.get() ? 'error' : 'success' },
      p(result.get()),
    ),
  );
});

// Example 2: Component with async error handling
const AsyncErrorComponent = component(() => {
  const isLoading = signal(false);
  const data = signal<string | null>(null);
  const error = signal<string | null>(null);

  const fetchData = async () => {
    isLoading.set(true);
    error.set(null);

    try {
      // Simulate API call that might fail
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Randomly throw an error to simulate failure
      if (Math.random() > 0.5) {
        throw new Error('API request failed!');
      }

      data.set('Data fetched successfully!');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error occurred';
      error.set(message);
      data.set(null);
    } finally {
      isLoading.set(false);
    }
  };

  return div(
    { className: 'component' },
    h3('Async Error Handling'),
    p('This component demonstrates error handling with async operations.'),
    button(
      {
        onclick: () => {
          fetchData();
        },
        disabled: isLoading.get(),
      },
      isLoading.get() ? 'Loading...' : 'Fetch Data',
    ),
    isLoading.get() && p('Loading data...'),
    data.get() && div({ className: 'success' }, p(data.get())),
    error.get() && div({ className: 'error' }, p('Error: ', error.get())),
  );
});

// Example 3: Component with conditional rendering based on error state
const ConditionalErrorComponent = component(() => {
  const hasError = signal(false);
  const errorDetails = signal<string | null>(null);

  const triggerError = () => {
    try {
      // Simulate some operation that might fail
      const random = Math.random();
      if (random < 0.3) {
        throw new Error('Random error occurred!');
      } else if (random < 0.6) {
        throw new TypeError('Type error occurred!');
      } else {
        throw new RangeError('Range error occurred!');
      }
    } catch (err) {
      hasError.set(true);
      if (err instanceof Error) {
        errorDetails.set(`${err.name}: ${err.message}`);
      } else {
        errorDetails.set('Unknown error occurred');
      }
    }
  };

  const resetError = () => {
    hasError.set(false);
    errorDetails.set(null);
  };

  // Conditional rendering based on error state
  if (hasError.get()) {
    return div(
      { className: 'component' },
      h3('Error State'),
      div(
        { className: 'error' },
        p('Something went wrong!'),
        p('Error details: ', errorDetails.get()),
        button({ onclick: () => resetError() }, 'Reset and Try Again'),
      ),
    );
  }

  return div(
    { className: 'component' },
    h3('Normal State'),
    p('Everything is working correctly!'),
    button({ onclick: () => triggerError() }, 'Trigger Error'),
  );
});

// Example 4: Component with conditional rendering based on error state
const ErrorRecoveryComponent = component(() => {
  const attempts = signal(0);
  const lastError = signal<string | null>(null);
  const isRecovered = signal(false);

  const riskyFunction = () => {
    attempts.set(attempts.get() + 1);

    try {
      // Simulate a function that fails the first few times
      if (attempts.get() < 3) {
        throw new Error(`Attempt ${attempts.get()} failed. Try again!`);
      }

      // Success after 3 attempts
      isRecovered.set(true);
      lastError.set(null);
      return 'Success!';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      lastError.set(message);
      return null;
    }
  };

  const reset = () => {
    attempts.set(0);
    lastError.set(null);
    isRecovered.set(false);
  };

  return div(
    { className: 'component' },
    h3('Error Recovery'),
    p('This component demonstrates error recovery with multiple attempts.'),
    p('Attempts: ', span(attempts.get().toString())),
    button(
      {
        onclick: () => {
          riskyFunction();
        },
        disabled: isRecovered.get(),
      },
      'Try Operation',
    ),
    lastError.get() &&
      div({ className: 'error' }, p('Last error: ', lastError.get())),
    isRecovered.get() &&
      div(
        { className: 'success' },
        p(
          'Operation recovered successfully after ',
          attempts.get(),
          ' attempts!',
        ),
      ),
    button({ onclick: () => reset(), className: 'danger' }, 'Reset'),
  );
});

// Main app component
const App = component(() => {
  return div(
    h3('Error Handling Examples'),
    p(
      'Each component below demonstrates different error handling strategies using try/catch:',
    ),
    RiskyComponent(),
    AsyncErrorComponent(),
    ConditionalErrorComponent(),
    ErrorRecoveryComponent(),
  );
});

// Render the app
render(App, document.getElementById('app')!);
