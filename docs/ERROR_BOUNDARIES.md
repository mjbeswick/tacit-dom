# Error Boundaries in Tacit-DOM

Error boundaries provide a way to catch JavaScript errors anywhere in your component tree and display a fallback UI instead of crashing the entire application. This is similar to React's error boundary concept but adapted for Tacit-DOM's reactive component system.

## Overview

Error boundaries are components that:

- Catch errors during rendering, lifecycle methods, and constructors of child components
- Display fallback UI when errors occur
- Provide error reporting and recovery mechanisms
- Prevent the entire application from crashing due to component errors

## Basic Usage

### Simple Error Boundary

```typescript
import { errorBoundary, div, h2, p, button } from 'tacit-dom';

// Component that might throw an error
const BuggyComponent = () => {
  if (Math.random() > 0.5) {
    throw new Error('Random error occurred!');
  }
  return div('Component rendered successfully');
};

// Wrap with error boundary
const SafeComponent = errorBoundary(BuggyComponent);

// Use the safe component
render(SafeComponent, document.getElementById('app'));
```

### Custom Fallback UI

```typescript
const CustomErrorFallback = (error: Error) =>
  div(
    { className: 'error-boundary' },
    h2('🚨 Something went wrong'),
    p(`Error: ${error.message}`),
    button({ onclick: () => window.location.reload() }, 'Reload Page'),
  );

const SafeComponent = errorBoundary(BuggyComponent, {
  fallback: CustomErrorFallback,
});
```

### Error Callbacks

```typescript
const SafeComponent = errorBoundary(BuggyComponent, {
  onError: (error, errorInfo) => {
    // Log error to console
    console.error('Component error:', error);

    // Send to error reporting service
    errorReportingService.captureException(error, {
      extra: errorInfo,
    });
  },
});
```

## API Reference

### `errorBoundary<P>(component, options?)`

Creates an error boundary wrapper around a component.

#### Parameters

- **`component`**: The component function to wrap with error boundary
- **`options`**: Optional configuration object

#### Options

- **`fallback`**: `(error: Error) => HTMLElement` - Custom error UI function
- **`onError`**: `(error: Error, errorInfo: { componentStack?: string }) => void` - Error callback function
- **`logToConsole`**: `boolean` - Whether to log errors to console (default: true)

#### Returns

A component wrapped with error boundary functionality that can be used like any other component.

### Error Boundary Component Methods

Error boundary components have additional methods for advanced error handling:

#### `_triggerError(error: Error, info?: { componentStack?: string })`

Manually trigger the error boundary state. Useful for testing or programmatic error handling.

```typescript
const SafeComponent = errorBoundary(MyComponent);
const element = SafeComponent();

// Manually trigger error
SafeComponent._triggerError(new Error('Manual error'));
```

#### `_reset()`

Reset the error state and return to normal rendering.

```typescript
const SafeComponent = errorBoundary(MyComponent);

// Reset error state
SafeComponent._reset();
```

## Advanced Patterns

### Conditional Error Boundaries

```typescript
const ConditionalErrorBoundary = (shouldWrap: boolean) => {
  if (shouldWrap) {
    return errorBoundary(MyComponent, {
      fallback: (error) => div('Error occurred: ' + error.message),
    });
  }
  return MyComponent;
};
```

### Nested Error Boundaries

```typescript
const OuterErrorBoundary = errorBoundary(() =>
  div(h1('Outer Component'), InnerErrorBoundary()),
);

const InnerErrorBoundary = errorBoundary(() =>
  div(h2('Inner Component'), BuggyComponent()),
);
```

### Error Boundary with Recovery

```typescript
const RecoverableComponent = createReactiveComponent(() => {
  const hasError = signal(false);

  if (hasError.get()) {
    throw new Error('Component error');
  }

  return div(
    button({ onclick: () => hasError.set(true) }, 'Trigger Error'),
    button({ onclick: () => hasError.set(false) }, 'Reset'),
  );
});

const SafeComponent = errorBoundary(RecoverableComponent);
```

### Error Boundary with Props

```typescript
const BuggyComponent = createReactiveComponent<{ mode: 'normal' | 'error' }>(
  (props) => {
    if (props?.mode === 'error') {
      throw new Error('Error mode activated');
    }

    return div(`Mode: ${props?.mode || 'normal'}`);
  },
);

const SafeComponent = errorBoundary(BuggyComponent);

// Usage
SafeComponent({ mode: 'normal' }); // Renders normally
SafeComponent({ mode: 'error' }); // Shows error fallback
```

## Error Handling Strategies

### Graceful Degradation

```typescript
const FeatureComponent = () => {
  try {
    // Try to use a feature that might not be available
    if (!window.IntersectionObserver) {
      throw new Error('IntersectionObserver not supported');
    }
    return div('Advanced feature enabled');
  } catch (error) {
    return div('Basic fallback feature');
  }
};

const SafeFeature = errorBoundary(FeatureComponent);
```

### Retry Mechanisms

```typescript
const RetryableComponent = createReactiveComponent(() => {
  const retryCount = signal(0);
  const maxRetries = 3;

  if (retryCount.get() >= maxRetries) {
    throw new Error('Max retries exceeded');
  }

  return div(
    p(`Attempt ${retryCount.get() + 1} of ${maxRetries}`),
    button({ onclick: () => retryCount.set(retryCount.get() + 1) }, 'Retry'),
  );
});
```

### Error Reporting Integration

```typescript
const ErrorReportingBoundary = (component: any) =>
  errorBoundary(component, {
    onError: (error, errorInfo) => {
      // Send to Sentry, LogRocket, or other error reporting service
      Sentry.captureException(error, {
        tags: {
          component: component.name || 'Unknown',
          boundary: 'ErrorBoundary',
        },
        extra: errorInfo,
      });
    },
  });
```

## Best Practices

### 1. Use Error Boundaries Strategically

Don't wrap every component with an error boundary. Instead, place them at strategic locations:

```typescript
// Wrap major sections
const App = () =>
  div(
    Header(),
    errorBoundary(MainContent, {
      fallback: (error) => div('Main content error: ' + error.message),
    }),
    Footer(),
  );
```

### 2. Provide Meaningful Fallback UI

```typescript
const UserFriendlyFallback = (error: Error) =>
  div(
    { className: 'error-boundary user-friendly' },
    h2('We encountered a problem'),
    p('Sorry, something went wrong while loading this content.'),
    p(
      'Please try refreshing the page or contact support if the problem persists.',
    ),
    button({ onclick: () => window.location.reload() }, 'Refresh Page'),
    button(
      { onclick: () => window.open('/support', '_blank') },
      'Contact Support',
    ),
  );
```

### 3. Handle Different Error Types

```typescript
const SmartFallback = (error: Error) => {
  if (error.message.includes('Network')) {
    return div('Network error - please check your connection');
  }

  if (error.message.includes('Permission')) {
    return div('Access denied - please log in again');
  }

  return div('An unexpected error occurred');
};
```

### 4. Clean Up Resources

```typescript
const CleanupErrorBoundary = (component: any) =>
  errorBoundary(component, {
    onError: (error) => {
      // Clean up any resources
      cleanupSubscriptions();
      resetState();

      // Log error
      console.error('Error with cleanup:', error);
    },
  });
```

## Testing Error Boundaries

### Unit Testing

```typescript
describe('Error Boundary', () => {
  it('should catch errors and render fallback', () => {
    const BuggyComponent = () => {
      throw new Error('Test error');
    };

    const SafeComponent = errorBoundary(BuggyComponent);
    const element = SafeComponent();

    expect(element.querySelector('h2')).toBeTruthy();
    expect(element.textContent).toContain('Something went wrong');
  });

  it('should call onError callback', () => {
    const onError = jest.fn();
    const BuggyComponent = () => {
      throw new Error('Test error');
    };

    const SafeComponent = errorBoundary(BuggyComponent, { onError });
    SafeComponent();

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });
});
```

### Integration Testing

```typescript
it('should recover from errors', () => {
  const TestComponent = createReactiveComponent(() => div('Normal'));
  const SafeComponent = errorBoundary(TestComponent);

  // Normal render
  let element = SafeComponent();
  expect(element.textContent).toBe('Normal');

  // Trigger error
  SafeComponent._triggerError(new Error('Test'));
  element = SafeComponent();
  expect(element.querySelector('h2')).toBeTruthy();

  // Reset and recover
  SafeComponent._reset();
  element = SafeComponent();
  expect(element.textContent).toBe('Normal');
});
```

## Limitations and Considerations

### Synchronous Errors Only

Error boundaries only catch synchronous errors during rendering. Asynchronous errors (like those in `setTimeout`, `Promise.reject`, or event handlers) must be handled separately.

```typescript
// This won't be caught by error boundary
const AsyncErrorComponent = () => {
  setTimeout(() => {
    throw new Error('Async error');
  }, 100);

  return div('Component');
};

// Handle async errors manually
const SafeAsyncComponent = () => {
  const handleAsyncOperation = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      console.error('Async error:', error);
      // Handle error appropriately
    }
  };

  return div(button({ onclick: handleAsyncOperation }, 'Risky Operation'));
};
```

### Event Handler Errors

Errors in event handlers are not caught by error boundaries:

```typescript
const SafeComponent = errorBoundary(() =>
  button(
    {
      onclick: () => {
        // This error won't be caught by error boundary
        throw new Error('Event handler error');
      },
    },
    'Click me',
  ),
);
```

### Performance Considerations

Error boundaries add a small performance overhead due to try-catch wrapping. This is typically negligible but should be considered for performance-critical applications.

## Migration from React

If you're familiar with React error boundaries, here are the key differences:

### React Error Boundaries

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### Tacit-DOM Error Boundaries

```typescript
const SafeComponent = errorBoundary(MyComponent, {
  fallback: (error) => h1('Something went wrong'),
  onError: (error, errorInfo) => console.error('Error:', error, errorInfo),
});
```

## Conclusion

Error boundaries in Tacit-DOM provide a robust way to handle component errors gracefully, improving user experience and application stability. By strategically placing error boundaries and providing meaningful fallback UI, you can create applications that gracefully degrade when errors occur rather than crashing entirely.

Remember to:

- Use error boundaries strategically, not everywhere
- Provide user-friendly fallback UI
- Implement proper error reporting and logging
- Handle both synchronous and asynchronous errors appropriately
- Test error boundaries thoroughly in your application
