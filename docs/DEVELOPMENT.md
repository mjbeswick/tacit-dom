# Development Guide

This guide covers how to develop and contribute to the Reactive-DOM library.

## Project Structure

```
reactive-dom/
├── src/                    # Source code
│   ├── signal.ts          # Reactive signals and computed values
│   ├── dom.ts             # DOM element factories
│   └── index.ts           # Main exports
├── dist/                   # Built distribution files
├── examples/               # Examples and demos
│   ├── demos/             # Interactive development demos
│   │   ├── index.html     # Main demo page
│   │   ├── main.ts        # Demo implementations
│   │   ├── theme.css      # Global theme variables
│   │   ├── styles/        # CSS modules
│   │   └── README.md      # Demo documentation
│   └── tests/             # Test files and examples
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── package.json            # NPM configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Development server config
└── README.md              # Main documentation
```

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd reactive-dom

# Install dependencies
npm install
```

### Development Commands

```bash
# Build the library
npm run build

# Watch for changes and rebuild
npm run dev

# Start development server
npm run dev:server

# Check server status
./scripts/check-server.sh
```

## Development Workflow

### 1. Making Changes

1. **Source Code**: Edit files in the `src/` directory
2. **Examples**: Update demos in `examples/demos/`
3. **Tests**: Add tests in `examples/tests/`
4. **Documentation**: Update docs in `docs/`

### 2. Building

```bash
# Build the library
npm run build

# The built files will be in dist/
```

### 3. Testing

```bash
# Run the development server
npm run dev:server

# Open http://localhost:5173 to see examples
```

## Architecture

### Core Concepts

#### Signals

- Located in `src/signal.ts`
- Reactive state management
- Automatic dependency tracking
- Subscription system

#### DOM Elements

- Located in `src/dom.ts`
- Factory functions for HTML elements
- Event handling integration
- Reactive value support

#### Examples

- Located in `examples/demos/`
- Interactive demonstrations
- CSS modules with theming
- Comprehensive feature showcase

## CSS Modules & Theming

### Theme System

The project uses CSS custom properties for theming:

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  /* ... more variables */
}

[data-theme='dark'] {
  --primary-color: #0d6efd;
  /* ... dark theme overrides */
}
```

### CSS Modules

Each component has its own CSS module:

- `App.module.css` - Main layout
- `Counter.module.css` - Counter component
- `Todo.module.css` - Todo list component
- `ColorPicker.module.css` - Color picker component
- `Form.module.css` - Form validation component

### Adding New Components

1. Create the component in `examples/demos/main.ts`
2. Create CSS module in `examples/demos/styles/`
3. Add theme-aware styling
4. Update the demo page

## TypeScript

### Type Definitions

```typescript
// Signal types
type Signal<T> = {
  get(): T;
  set(value: T): void;
  subscribe(callback: () => void): () => void;
};

// Computation types
type Computation = {
  get(): any;
  subscribe(callback: () => void): () => void;
};
```

### Adding Types

1. Define types in the appropriate source file
2. Export types from `src/index.ts`
3. Update documentation in `docs/API.md`

## Testing

### Manual Testing

1. Start the development server: `npm run dev:server`
2. Open `http://localhost:5173`
3. Test all examples and features
4. Test theme switching
5. Test responsive design

### Automated Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## Documentation

### API Documentation

- Located in `docs/API.md`
- Comprehensive API reference
- Examples and best practices
- TypeScript type information

### Development Documentation

- Located in `docs/DEVELOPMENT.md` (this file)
- Development setup and workflow
- Architecture overview
- Contributing guidelines

### Example Documentation

- Located in `examples/demos/README.md`
- Interactive examples guide
- Feature demonstrations
- Theme system explanation

## Contributing

### Code Style

- Use TypeScript for all source code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use CSS modules for styling

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Update documentation
6. Submit a pull request

### Commit Messages

Use conventional commit messages:

```
feat: add new signal method
fix: resolve computed value bug
docs: update API documentation
style: improve CSS module organization
```

## Deployment

### Publishing to NPM

```bash
# Build the library
npm run build

# Publish to NPM
npm publish
```

### Development Server

```bash
# Start development server
npm run dev:server

# Server will be available at http://localhost:5173
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Run `npm run build` to check for TypeScript errors
2. **Server Not Starting**: Check if port 5173 is available
3. **CSS Modules Not Working**: Ensure Vite is properly configured
4. **Import Errors**: Check relative paths in examples

### Debugging

1. Check browser console for errors
2. Use `console.log` for debugging
3. Check network tab for failed requests
4. Verify file paths and imports

## Performance

### Optimization Tips

1. **Signal Optimization**: Only subscribe when necessary
2. **Computed Values**: Keep computation functions simple
3. **DOM Updates**: Minimize DOM manipulations
4. **CSS Modules**: Use scoped styles to avoid conflicts

### Monitoring

- Use browser dev tools to monitor performance
- Check for memory leaks with signal subscriptions
- Monitor bundle size with build tools
- Test with different browsers and devices

## Browser Support

### Supported Browsers

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Polyfills

The library uses modern JavaScript features. For older browsers, consider:

- Babel for transpilation
- Polyfills for missing features
- CSS custom properties fallbacks

## License

This project is licensed under the MIT License. See the LICENSE file for details.
