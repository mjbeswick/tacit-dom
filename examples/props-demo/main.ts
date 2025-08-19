import {
  button,
  component,
  div,
  h1,
  h2,
  p,
  render,
  signal,
} from '../../src/index';

// Example 1: Component without props
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

// Example 2: Component with simple props
const Greeting = component<{ name: string; greeting?: string }>((props) => {
  return div(
    { className: 'card p-3 mb-3' },
    h2('Greeting Component'),
    p(`${props?.greeting || 'Hello'}, ${props?.name || 'World'}!`),
  );
});

// Example 3: Component with complex props and signals
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

  const decrement = () => {
    const newValue = count.get() - (props?.step || 1);
    count.set(newValue);
    props?.onValueChange?.(newValue);
  };

  return div(
    { className: 'card p-3 mb-3' },
    h2(props?.title || 'Counter'),
    p(`Current value: ${count.get()}`),
    p(`Step size: ${props?.step || 1}`),
    div(
      { className: 'btn-group' },
      button(
        { onclick: decrement, className: 'btn btn-outline-secondary' },
        '-',
      ),
      button(
        { onclick: increment, className: 'btn btn-outline-secondary' },
        '+',
      ),
    ),
  );
});

// Example 4: Component that uses props reactively
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

// Main app component
const App = component(() => {
  const items = signal(['Apple', 'Banana', 'Cherry']);
  const lastChange = signal<string>('None');

  const handleCounterChange = (value: number) => {
    lastChange.set(`Counter changed to ${value}`);
  };

  const addItem = () => {
    const newItems = [...items.get(), `Item ${items.get().length + 1}`];
    items.set(newItems);
  };

  return div(
    { className: 'container mt-4' },
    h1('Component Props Demo'),
    p('This example demonstrates components with and without props'),

    // Components without props
    SimpleCounter(),

    // Components with simple props
    Greeting({ name: 'Alice' }),
    Greeting({ name: 'Bob', greeting: 'Good morning' }),

    // Component with complex props
    AdvancedCounter({
      initialValue: 10,
      step: 5,
      title: 'Advanced Counter',
      onValueChange: handleCounterChange,
    }),

    // Display last change
    div(
      { className: 'alert alert-info' },
      p('Last counter change:'),
      p({ className: 'fw-bold' }, lastChange.get()),
    ),

    // Reactive component with props
    ReactiveDisplay({
      title: 'Dynamic Items',
      items: items.get(),
    }),

    // Button to add items
    button({ onclick: addItem, className: 'btn btn-success' }, 'Add Item'),
  );
});

// Render the app
render(App, document.getElementById('app')!);
