# Development Guide

## 📁 Project Structure

```
reactive-dom/
├── src/                    # Source code
│   ├── reactivity.ts       # Reactive signals and computed values
│   ├── reactive-dom.ts     # DOM element factories
│   ├── class-names.ts      # CSS class name utilities
│   ├── router.ts          # Router implementation
│   └── index.ts           # Main exports
├── dist/                   # Built distribution files
│   ├── reactive-dom.esm.js # ES Module bundle (2.47 KB gzipped)
│   ├── reactive-dom.umd.js # UMD bundle (2.57 KB gzipped)
│   ├── reactive-dom.cjs.js # CommonJS bundle (2.47 KB gzipped)
│   ├── *.d.ts             # TypeScript declarations
│   └── modules/           # Individual modules for tree-shaking
├── examples/               # Examples and demos
│   ├── index.html         # Main navigation page
│   ├── counter/           # Counter example
│   ├── random-generator/  # Random generator example
│   ├── debug/             # Debug example
│   ├── router/            # Router example
│   └── vite.config.ts     # Vite configuration
├── docs/                   # Documentation
├── package.json            # NPM configuration
├── tsconfig.json          # TypeScript configuration
├── rollup.config.js       # Rollup build configuration
├── vite.config.ts         # Development server config
└── README.md              # This file
```

## 🛠️ Development

### Running the Development Server

```bash
# Start the development server for examples (port 5173)
npm run examples

# Preview examples
npm run examples:preview

# Build examples
npm run examples:build
```

The development server will be available at `http://localhost:5173`

### Building the Library

```bash
# Build the library with Rollup (recommended)
npm run build

# Build with TypeScript only
npm run build:tsc

# Watch for changes
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm test
```

### Code Quality

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Auto-fix formatting and linting
npm run format:fix

# Security audit
npm run security-audit
```

### Examples Development

The examples are now managed separately in the `examples/` directory:

```bash
# Navigate to examples
cd examples

# Install dependencies
npm install

# Start development server
npm run dev

# Build examples
npm run build

# Preview built examples
npm run preview
```

See the [examples README](examples/README.md) for more details.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📦 Building

```bash
# Build for production
npm run build

# Build TypeScript declarations
npm run build:tsc

# Build with production optimizations
npm run build:prod
```

## 🔧 Configuration Files

- **`.eslintrc.json`** - ESLint configuration for code quality
- **`.prettierrc`** - Prettier configuration for code formatting
- **`tsconfig.json`** - TypeScript configuration
- **`rollup.config.js`** - Rollup build configuration
- **`vite.config.ts`** - Vite development server configuration
- **`jest.config.cjs`** - Jest testing configuration

## 📚 Documentation

- **`README.md`** - Main project documentation
- **`docs/API.md`** - API reference
- **`docs/ROUTER.md`** - Router documentation
- **`examples/README.md`** - Examples documentation
