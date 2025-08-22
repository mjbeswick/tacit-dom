import { button, computed, div, effect, render, signal } from 'tacit-dom';
import styles from './styles.module.css';

// Calculator state
type CalculatorState = {
  currentValue: string;
  previousValue: string | null;
  operation: string | null;
  waitingForOperand: boolean;
};

const calculatorState = signal<CalculatorState>({
  currentValue: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
});

// Computed values
const displayValue = computed(() => calculatorState.get().currentValue);
const expression = computed(() => {
  const state = calculatorState.get();
  if (state.previousValue && state.operation) {
    return `${state.previousValue} ${state.operation}`;
  }
  return '';
});

// Calculator functions
function inputDigit(digit: string) {
  console.log('Input digit called with:', digit);
  const state = calculatorState.get();

  // Allow bigger numbers - limit to 16 digits
  const maxDigits = 16;

  if (state.waitingForOperand) {
    calculatorState.set({
      ...state,
      currentValue: digit,
      waitingForOperand: false,
    });
  } else {
    // Check if adding this digit would exceed the limit
    if (state.currentValue === '0') {
      // If current value is 0, replace it with the new digit
      calculatorState.set({
        ...state,
        currentValue: digit,
      });
    } else if (state.currentValue.length < maxDigits) {
      // Only add digit if we haven't reached the limit
      calculatorState.set({
        ...state,
        currentValue: state.currentValue + digit,
      });
    } else {
      // Optionally show some feedback that limit is reached
      console.log('Maximum digits reached');
    }
  }
  console.log('New state:', calculatorState.get());
}

function inputDecimal() {
  const state = calculatorState.get();

  if (state.waitingForOperand) {
    calculatorState.set({
      ...state,
      currentValue: '0.',
      waitingForOperand: false,
    });
  } else if (state.currentValue.indexOf('.') === -1) {
    calculatorState.set({
      ...state,
      currentValue: state.currentValue + '.',
    });
  }
}

function clear() {
  calculatorState.set({
    currentValue: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  });
}

function deleteLastDigit() {
  const state = calculatorState.get();

  if (state.waitingForOperand) {
    return;
  }

  if (state.currentValue.length === 1) {
    calculatorState.set({
      ...state,
      currentValue: '0',
    });
  } else {
    calculatorState.set({
      ...state,
      currentValue: state.currentValue.slice(0, -1),
    });
  }
}

function performOperation(nextOperation: string) {
  const state = calculatorState.get();
  const inputValue = parseFloat(state.currentValue);

  if (state.previousValue === null) {
    calculatorState.set({
      ...state,
      previousValue: state.currentValue,
      operation: nextOperation,
      waitingForOperand: true,
    });
  } else if (state.operation) {
    const previousValue = parseFloat(state.previousValue);
    let newValue: number;

    switch (state.operation) {
      case '+':
        newValue = previousValue + inputValue;
        break;
      case '-':
        newValue = previousValue - inputValue;
        break;
      case '×':
        newValue = previousValue * inputValue;
        break;
      case '÷':
        newValue = previousValue / inputValue;
        break;
      default:
        return;
    }

    calculatorState.set({
      ...state,
      currentValue: String(newValue),
      previousValue: String(newValue),
      operation: nextOperation,
      waitingForOperand: true,
    });
  }
}

function calculate() {
  const state = calculatorState.get();

  if (!state.previousValue || !state.operation) {
    return;
  }

  const inputValue = parseFloat(state.currentValue);
  const previousValue = parseFloat(state.previousValue);
  let newValue: number;

  switch (state.operation) {
    case '+':
      newValue = previousValue + inputValue;
      break;
    case '-':
      newValue = previousValue - inputValue;
      break;
    case '×':
      newValue = previousValue * inputValue;
      break;
    case '÷':
      newValue = previousValue / inputValue;
      break;
    default:
      return;
  }

  calculatorState.set({
    currentValue: String(newValue),
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  });
}

function percentage() {
  const state = calculatorState.get();
  const currentValue = parseFloat(state.currentValue);
  const newValue = currentValue / 100;

  calculatorState.set({
    ...state,
    currentValue: String(newValue),
  });
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
      div({ className: styles.result }, currentDisplayValue),
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
      const currentValue = calculatorState.get().currentValue;
      const previousValue = calculatorState.get().previousValue;
      const operation = calculatorState.get().operation;

      console.log('State changed, re-rendering...', { currentValue, previousValue, operation });

      // Re-render the calculator
      render(Calculator(), app);
    });
  } catch (error) {
    console.error('Error rendering calculator:', error);
  }
} else {
  console.error('App element not found!');
}
