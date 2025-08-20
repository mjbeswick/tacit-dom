# Error Boundary Demo

This demo showcases the `errorBoundary` function in Tacit-DOM, which provides React-like error boundary functionality for catching and handling component errors gracefully.

## Features Demonstrated

- **Basic Error Boundary**: Simple error catching with default fallback UI
- **Custom Fallback UI**: Personalized error handling with custom styling
- **Error Recovery**: Components that can recover from errors
- **Manual Error Triggering**: Programmatic error handling and recovery

## Running the Demo

```bash
npm install
npm run dev
```

The demo will open in your browser at `http://localhost:3004`.

## How It Works

The `errorBoundary` function wraps components and provides:

1. **Error Catching**: Catches synchronous errors during component rendering
2. **Fallback UI**: Renders a fallback interface when errors occur
3. **Error Reporting**: Calls optional `onError` callbacks for logging/monitoring
4. **Recovery Options**: Provides methods to reset error state and retry

## Usage Examples

### Basic Error Boundary

```typescript
const SafeComponent = errorBoundary(() => div('This might throw an error'));
```

### Custom Fallback

```typescript
const SafeComponent = errorBoundary(() => div('Component'), {
  fallback: (error) =>
    div(
      h2('Custom Error UI'),
      p(error.message),
      button({ onclick: () => window.location.reload() }, 'Reload'),
    ),
});
```

### Error Callbacks

```typescript
const SafeComponent = errorBoundary(() => div('Component'), {
  onError: (error, errorInfo) => {
    console.error('Component error:', error);
    // Send to error reporting service
  },
});
```

## API Reference

### `errorBoundary<P>(component, options?)`

- **`component`**: The component function to wrap
- **`options`**: Optional configuration object
  - **`fallback`**: Custom error UI function
  - **`onError`**: Error callback function
  - **`logToConsole`**: Whether to log errors to console (default: true)

### Error Boundary Component Methods

- **`_triggerError(error, info?)`**: Manually trigger error state
- **`_reset()`**: Reset error state and return to normal rendering

## Benefits

- **Graceful Degradation**: Prevents entire app crashes
- **Better UX**: Users see helpful error messages instead of blank screens
- **Debugging**: Structured error reporting and recovery options
- **Production Resilience**: Catches runtime errors that might slip through development
