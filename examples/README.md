# Reactive DOM Examples

This directory contains examples demonstrating the reactive-dom library.

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the main library:**

   ```bash
   cd ..
   npm run build
   cd examples
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to see the examples.

## Available Examples

- **Counter** (`/counter/`) - Basic reactive signals with increment/decrement
- **Random Generator** (`/random-generator/`) - Reactive signals with random number generation
- **Debug** (`/debug/`) - Simple debugging example
- **Router** (`/router/`) - Full router example with loaders and navigation

## Scripts

- `npm run dev` - Start development server
- `npm run preview` - Preview built examples
- `npm run build` - Build examples for production
- `npm run type-check` - Run TypeScript type checking

## Development

The examples use the local `reactive-dom` package, so any changes to the main library need to be built before they appear in the examples.

To rebuild the main library and restart the examples:

```bash
cd ..
npm run build
cd examples
npm run dev
```
