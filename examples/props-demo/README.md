# Thorix Component Props Demo

This example demonstrates how to use Thorix components with props for strongly-typed, reusable UI components.

## Naming Convention

- **`component`** - Function to create reactive components (alias for `createReactiveComponent`)
- **`Component<P>`** - Type for reactive components with props

## Features

### 1. Components Without Props

```typescript
const SimpleCounter = component(() => {
  const count = signal(0);

  return div(
    { className: 'card p-3 mb-3' },
    h2('Simple Counter (No Props)'),
    p(`Count: ${count.get()}`),
    button(
      {
        onclick: () => count.set(count.get() + 1),
        className: 'btn btn-primary',
      },
      'Increment',
    ),
  );
});

// Usage
SimpleCounter();
```

### 2. Components With Simple Props

```typescript
const Greeting = component<{ name: string; greeting?: string }>((props) => {
  return div(
    { className: 'card p-3 mb-3' },
    h2('Greeting Component'),
    p(`${props?.greeting || 'Hello'}, ${props?.name || 'World'}!`),
  );
});

// Usage
Greeting({ name: 'Alice' });
Greeting({ name: 'Bob', greeting: 'Good morning' });
```

### 3. Components With Complex Props

```typescript
type CounterProps = {
  initialValue: number;
  step: number;
  title: string;
  onValueChange?: (value: number) => void;
};

const AdvancedCounter = component<CounterProps>((props) => {
  const count = signal(props?.initialValue || 0);

  const increment = () => {
    const newValue = count.get() + (props?.step || 1);
    count.set(newValue);
    props?.onValueChange?.(newValue);
  };

  return div(
    { className: 'card p-3 mb-3' },
    h2(props?.title || 'Counter'),
    p(`Current value: ${count.get()}`),
    button({ onclick: increment, className: 'btn btn-primary' }, '+'),
  );
});

// Usage
AdvancedCounter({
  initialValue: 10,
  step: 5,
  title: 'Advanced Counter',
  onValueChange: (value) => console.log(`Counter changed to ${value}`),
});
```

### 4. Reactive Components With Props

```typescript
const ReactiveDisplay = component<{ items: string[]; title: string }>(
  (props) => {
    return div(
      { className: 'card p-3 mb-3' },
      h2(props?.title || 'Items List'),
      props?.items && props.items.length > 0
        ? div(
            { className: 'list-group' },
            ...props.items.map((item, index) =>
              div(
                { key: index, className: 'list-group-item' },
                `${index + 1}. ${item}`,
              ),
            ),
          )
        : p('No items to display'),
    );
  },
);

// Usage
const items = signal(['Apple', 'Banana', 'Cherry']);
ReactiveDisplay({
  title: 'Dynamic Items',
  items: items.get(),
});
```

## Key Benefits

1. **Strongly Typed**: Props are fully typed with TypeScript generics
2. **Reactive**: Components automatically re-render when signals change
3. **Reusable**: Components can be used multiple times with different props
4. **Flexible**: Props are optional and can have default values
5. **Composable**: Components can be nested and combined easily

## Running the Demo

```bash
cd examples/props-demo
npm install
npm run dev
```

Open your browser to see the interactive examples in action!
