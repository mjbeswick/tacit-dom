import { button, computed, div, effect, render, signal } from 'tacit-dom';
import styles from './styles.module.css';

// Calculator state - using atomic signals
const currentValue = signal<string>('0');
const previousValue = signal<string | null>(null);
const operation = signal<string | null>(null);
const waitingForOperand = signal<boolean>(false);

// Computed values
const displayValue = computed(() => currentValue.get());
const expression = computed(() => {
  const prev = previousValue.get();
  const op = operation.get();
  if (prev && op) {
    return `${prev} ${op}`;
  }
  return '';
});

// Calculator functions
function inputDigit(digit: string) {
  console.log('Input digit called with:', digit);
  const state = {
    currentValue: currentValue.get(),
    previousValue: previousValue.get(),
    operation: operation.get(),
    waitingForOperand: waitingForOperand.get(),
  };

  // Allow bigger numbers - limit to 16 digits
  const maxDigits = 16;

  if (state.waitingForOperand) {
    currentValue.set(digit);
    waitingForOperand.set(false);
  } else {
    // Check if adding this digit would exceed the limit
    if (state.currentValue === '0') {
      // If current value is 0, replace it with the new digit
      currentValue.set(digit);
    } else if (state.currentValue.length < maxDigits) {
      // Only add digit if we haven't reached the limit
      currentValue.set(state.currentValue + digit);
    } else {
      // Optionally show some feedback that limit is reached
      console.log('Maximum digits reached');
    }
  }
  console.log('New state:', {
    currentValue: currentValue.get(),
    previousValue: previousValue.get(),
    operation: operation.get(),
    waitingForOperand: waitingForOperand.get(),
  });
}

function inputDecimal() {
  const state = {
    currentValue: currentValue.get(),
    previousValue: previousValue.get(),
    operation: operation.get(),
    waitingForOperand: waitingForOperand.get(),
  };

  if (state.waitingForOperand) {
    currentValue.set('0.');
    waitingForOperand.set(false);
  } else if (state.currentValue.indexOf('.') === -1) {
    currentValue.set(state.currentValue + '.');
  }
}

function clear() {
  currentValue.set('0');
  previousValue.set(null);
  operation.set(null);
  waitingForOperand.set(false);
}

function deleteLastDigit() {
  const state = {
    currentValue: currentValue.get(),
    previousValue: previousValue.get(),
    operation: operation.get(),
    waitingForOperand: waitingForOperand.get(),
  };

  if (state.waitingForOperand) {
    return;
  }

  if (state.currentValue.length === 1) {
    currentValue.set('0');
  } else {
    currentValue.set(state.currentValue.slice(0, -1));
  }
}

function performOperation(nextOperation: string) {
  const currentVal = currentValue.get();
  const prevVal = previousValue.get();
  const currentOp = operation.get();
  const waiting = waitingForOperand.get();
  const inputValue = parseFloat(currentVal);

  if (prevVal === null) {
    previousValue.set(currentVal);
    operation.set(nextOperation);
    waitingForOperand.set(true);
  } else if (currentOp) {
    const prevValue = parseFloat(prevVal);
    let newValue: number;

    switch (currentOp) {
      case '+':
        newValue = prevValue + inputValue;
        break;
      case '-':
        newValue = prevValue - inputValue;
        break;
      case '×':
        newValue = prevValue * inputValue;
        break;
      case '÷':
        newValue = prevValue / inputValue;
        break;
      default:
        return;
    }

    currentValue.set(String(newValue));
    previousValue.set(String(newValue));
    operation.set(nextOperation);
    waitingForOperand.set(true);
  }
}

function calculate() {
  const currentVal = currentValue.get();
  const prevVal = previousValue.get();
  const currentOp = operation.get();

  if (!prevVal || !currentOp) {
    return;
  }

  const inputValue = parseFloat(currentVal);
  const prevValue = parseFloat(prevVal);
  let newValue: number;

  switch (currentOp) {
    case '+':
      newValue = prevValue + inputValue;
      break;
    case '-':
      newValue = prevValue - inputValue;
      break;
    case '×':
      newValue = prevValue * inputValue;
      break;
    case '÷':
      newValue = prevValue / inputValue;
      break;
    default:
      return;
  }

  currentValue.set(String(newValue));
  previousValue.set(null);
  operation.set(null);
  waitingForOperand.set(false);
}

function percentage() {
  const currentVal = currentValue.get();
  const currentValNum = parseFloat(currentVal);
  const newValue = currentValNum / 100;

  currentValue.set(String(newValue));
}

// Calculator component
function Calculator() {
  // Make the component reactive by accessing signals in the render
  const currentDisplayValue = displayValue.get();
  const currentExpression = expression.get();

  console.log('Rendering calculator with:', { currentDisplayValue, currentExpression });

  return div(
    { className: styles.calculator },

    // Display
    div(
      { className: styles.display },
      div({ className: styles.expression }, currentExpression),
      div(
        {
          className: `${styles.result} ${styles[`digits-${currentDisplayValue.length}`] || ''}`.trim(),
        },
        currentDisplayValue,
      ),
    ),

    // Buttons
    div(
      { className: styles.buttons },

      // First row
      button({ className: `${styles.btn} ${styles.clear}`, onClick: clear }, 'C'),
      button({ className: `${styles.btn} ${styles.delete}`, onClick: deleteLastDigit }, '⌫'),
      button({ className: `${styles.btn} ${styles.operator}`, onClick: () => percentage() }, '%'),
      button({ className: `${styles.btn} ${styles.operator}`, onClick: () => performOperation('÷') }, '÷'),

      // Second row
      button({ className: styles.btn, onClick: () => inputDigit('7') }, '7'),
      button({ className: styles.btn, onClick: () => inputDigit('8') }, '8'),
      button({ className: styles.btn, onClick: () => inputDigit('9') }, '9'),
      button({ className: `${styles.btn} ${styles.operator}`, onClick: () => performOperation('×') }, '×'),

      // Third row
      button({ className: styles.btn, onClick: () => inputDigit('4') }, '4'),
      button({ className: styles.btn, onClick: () => inputDigit('5') }, '5'),
      button({ className: styles.btn, onClick: () => inputDigit('6') }, '6'),
      button({ className: `${styles.btn} ${styles.operator}`, onClick: () => performOperation('-') }, '−'),

      // Fourth row
      button({ className: styles.btn, onClick: () => inputDigit('1') }, '1'),
      button({ className: styles.btn, onClick: () => inputDigit('2') }, '2'),
      button({ className: styles.btn, onClick: () => inputDigit('3') }, '3'),
      button({ className: `${styles.btn} ${styles.operator}`, onClick: () => performOperation('+') }, '+'),

      // Fifth row
      button({ className: `${styles.btn} ${styles.zero}`, onClick: () => inputDigit('0') }, '0'),
      button({ className: styles.btn, onClick: inputDecimal }, '.'),
      button({ className: `${styles.btn} ${styles.equals}`, onClick: calculate }, '='),
    ),
  );
}

// Render the calculator
const app = document.getElementById('app');
if (app) {
  console.log('App element found, rendering calculator...');
  try {
    // Initial render
    render(Calculator(), app);
    console.log('Calculator rendered successfully');

    // Set up reactive re-rendering
    effect(() => {
      // Access the signals to trigger re-renders
      const currentVal = currentValue.get();
      const prevVal = previousValue.get();
      const currentOp = operation.get();

      console.log('State changed, re-rendering...', { currentVal, prevVal, currentOp });

      // Re-render the calculator
      render(Calculator(), app);
    });
  } catch (error) {
    console.error('Error rendering calculator:', error);
  }
} else {
  console.error('App element not found!');
}
