# Reactive-DOM Examples

This directory contains examples demonstrating how to use the reactive-dom library.

## Examples

### Counter (`/counter`)

A simple counter example showing basic reactive state management.

```bash
cd counter
npm install
npm run dev
```

### Debug (`/debug`)

A debugging example that shows reactive state changes in real-time.

```bash
cd debug
npm install
npm run dev
```

### Random Generator (`/random-generator`)

An example that generates random numbers with reactive updates.

```bash
cd random-generator
npm install
npm run dev
```

### Router (`/router`)

A more complex example demonstrating client-side routing with reactive-dom.

```bash
cd router
npm install
npm run dev
```

## Running Examples

Each example is self-contained with its own `package.json`, `vite.config.ts`, and `tsconfig.json`. To run any example:

1. Navigate to the example directory
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the displayed URL

## Ports

Each example runs on a different port to avoid conflicts:

- Counter: `http://localhost:5173`
- Debug: `http://localhost:5174`
- Random Generator: `http://localhost:5175`
- Router: `http://localhost:5176`

## Building Examples

To build an example for production:

```bash
cd <example-directory>
npm run build
```

The built files will be in the `dist` directory of each example.

## Running All Examples

To run all examples simultaneously:

```bash
./run-all.sh
```

This will start all examples on their respective ports:

- Counter: `http://localhost:5173`
- Debug: `http://localhost:5174`
- Random Generator: `http://localhost:5175`
- Router: `http://localhost:5176`
