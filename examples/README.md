# Domitor Examples

This directory contains examples demonstrating how to use the Domitor library.

## Examples

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

A more complex example demonstrating client-side routing with Domitor.

```bash
cd router
npm install
npm run dev
```

### Strongly Typed Props (`/strongly-typed-props`)

An example demonstrating the strongly typed props functionality in Domitor. Shows how each HTML element has its own specific prop type for better TypeScript support.

```bash
cd strongly-typed-props
npm install
npm run dev
```

### Signals (`/signals`)

An example demonstrating the unified signal API with preserved signals and reactive updates.

```bash
cd signals
npm install
npm run dev
```

### ClassNames (`/classnames`)

An example demonstrating the classNames utility for dynamic CSS class management.

```bash
cd classnames
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

- Debug: `http://localhost:5173`
- Random Generator: `http://localhost:5174`
- Router: `http://localhost:5175`
- Strongly Typed Props: `http://localhost:5176`
- Signals: `http://localhost:5177`
- ClassNames: `http://localhost:5178`

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

- Debug: `http://localhost:5173`
- Random Generator: `http://localhost:5174`
- Router: `http://localhost:5175`
- Strongly Typed Props: `http://localhost:5176`
- Signals: `http://localhost:5177`
- ClassNames: `http://localhost:5178`
