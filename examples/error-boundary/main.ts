import { button, component, computed, div, errorBoundary, h2, p, render, signal } from '../../src';

// Global variables for manual error demo
let manualErrorComponent: any = null;
let manualErrorContainer: HTMLElement | null = null;

// Component that sometimes throws errors
const BuggyComponent = component<{ shouldThrow?: boolean }>((props) => {
  const count = signal(0);
  const doubled = computed(() => count.get() * 2);

  if (props?.shouldThrow) {
    throw new Error('This component is intentionally broken!');
  }

  return div(
    div(
      h2('Working Component'),
      p(`Count: ${count.get()}`),
      p(`Doubled: ${doubled.get()}`),
      button({ onClick: () => count.set(count.get() + 1) }, 'Increment'),
    ),
  );
});

// Component that can recover from errors
const RecoverableComponent = component<{
  mode: 'normal' | 'error' | 'recovered';
}>((props) => {
  const mode = signal(props?.mode || 'normal');

  if (mode.get() === 'error') {
    throw new Error('Recovery test error');
  }

  return div(
    div(
      h2('Recoverable Component'),
      p(`Mode: ${mode.get()}`),
      button({ onClick: () => mode.set('normal') }, 'Set Normal'),
      button({ onClick: () => mode.set('error'), className: 'danger' }, 'Trigger Error'),
      button({ onClick: () => mode.set('recovered') }, 'Set Recovered'),
    ),
  );
});

// Custom error fallback component
const CustomErrorFallback = (error: Error) =>
  div(
    { className: 'error-boundary' },
    h2('🚨 Custom Error Handler'),
    p(`Something went wrong: ${error.message}`),
    p('This is a custom error UI with better styling and options.'),
    div(
      button({ onClick: () => window.location.reload() }, 'Reload Page'),
      button({ onClick: () => console.log('Error details:', error) }, 'Log Details'),
    ),
  );

// Basic error boundary demo
const BasicDemo = errorBoundary(BuggyComponent, {
  fallback: (_error) => div('Something went wrong!'),
});
render(BasicDemo, document.getElementById('basic-demo')!);

// Custom fallback demo
const CustomDemo = errorBoundary(BuggyComponent, {
  fallback: CustomErrorFallback,
});
render(CustomDemo, document.getElementById('custom-demo')!);

// Recovery demo
const RecoveryDemo = errorBoundary(RecoverableComponent, {
  fallback: (_error) => div('Something went wrong!'),
});
render(RecoveryDemo, document.getElementById('recovery-demo')!);

// Manual error demo
const ManualDemo = errorBoundary(
  component(() => div('Manual error demo - click buttons above')),
  {
    onError: (error) => {
      console.log('Manual error triggered:', error);
      updateStatus('manual-status', 'Error triggered manually', 'error');
    },
    fallback: (_error) => div('Something went wrong!'),
  },
);

manualErrorContainer = document.getElementById('manual-demo')!;
manualErrorComponent = ManualDemo;
render(ManualDemo, manualErrorContainer);

// Status update helper
function updateStatus(elementId: string, message: string, type: 'success' | 'error' | 'info') {
  const statusElement = document.getElementById(elementId);
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
  }
}

// Global functions for manual error demo
(window as any).triggerManualError = () => {
  if (manualErrorComponent && manualErrorComponent._triggerError) {
    manualErrorComponent._triggerError(new Error('Manually triggered error'));
    updateStatus('manual-status', 'Error triggered', 'error');

    // Re-render to show error state
    if (manualErrorContainer) {
      manualErrorContainer.innerHTML = '';
      render(manualErrorComponent, manualErrorContainer);
    }
  }
};

(window as any).resetManualError = () => {
  if (manualErrorComponent && manualErrorComponent._reset) {
    manualErrorComponent._reset();
    updateStatus('manual-status', 'Error state reset', 'success');

    // Re-render to show normal state
    if (manualErrorContainer) {
      manualErrorContainer.innerHTML = '';
      render(manualErrorComponent, manualErrorContainer);
    }
  }
};

// Update status messages
updateStatus('basic-status', 'Basic error boundary working', 'success');
updateStatus('custom-demo', 'Custom error fallback ready', 'info');
updateStatus('recovery-demo', 'Recovery component ready', 'info');
updateStatus('manual-demo', 'Manual error demo ready', 'info');
