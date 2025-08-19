---
marp: true
theme: default
class: lead
paginate: true
---

### Thorix

React-like reactive UI without JSX, providers, or virtual DOM.

— Pure TypeScript functions, reactive signals, and direct DOM manipulation —

---

### The React Reality Check

React is amazing, but its state model often adds complexity:

- **Re-render Model**: Components re-render top-to-bottom for small changes
- **useEffect Hell**: Dependency arrays and cleanup management overhead
- **Virtual DOM Costs**: Diffing/reconciliation overhead
- **State Boilerplate**: Context/provider nesting for global state
- **Build Complexity**: JSX transformation and tooling setup

---

### How Thorix Solves This

Thorix eliminates these pain points:

- **Direct DOM Updates**: Signals drive updates without virtual DOM overhead
- **Smart Dependencies**: Computed values track dependencies automatically
- **Simple Effects**: No dependency arrays or cleanup to manage
- **Global State**: Plain functions, no providers or context needed
- **Pure TypeScript**: No JSX required, just standard function calls

---

### Core Idea: Signals

```ts
import { signal } from 'thorix';

const count = signal(0);
count.get(); // 0
count.set(1);
count.update((v) => v + 1);
```

- Fine-grained reactivity: only DOM bound to `count` updates.

---

### Derived State: Computed

```ts
import { signal, computed } from 'thorix';

const a = signal(2);
const b = signal(3);
const sum = computed(() => a.get() + b.get());

// sum.get() reacts when a or b change
```

---

### Side Effects: effect and batch

```ts
import { signal, effect, batch } from 'thorix';

const n = signal(0);

effect(() => {
  console.log('n is', n.get());
});

batch(() => {
  n.set(1);
  n.set(2); // effects flush once after the batch
});
```

---

### Typed DOM creators (no JSX)

```ts
import { div, p, button, render, signal, computed } from 'thorix';

const App = () => {
  const count = signal(0, 'count');
  const doubled = computed(() => count.get() * 2);

  return div(
    { className: 'app' },
    p(`Count: ${count}`),
    p(`Doubled: ${doubled}`),
    button({ onclick: () => count.set(count.get() + 1) }, 'Increment'),
  );
};
```

- Pass reactive values directly; text updates automatically.
- `onclick` and other DOM events are supported.

---

### Rendering and Cleanup

```ts
const root = document.getElementById('app')!;
render(App, root);

// Later
cleanup(root); // Cleans subscriptions from elements inside root
```

- Automatic subscription tracking prevents leaks
- Manual `cleanup` is available when needed

---

### Dynamic attributes and classes

```ts
import { div, button, signal, computed } from 'thorix';

const isActive = signal(true);
const size = signal<'sm' | 'lg'>('lg');

const classes = computed(() => [
  'btn',
  { active: isActive.get(), disabled: !isActive.get() },
  size.get() === 'lg' ? 'btn-lg' : 'btn-sm',
]);

const Button = () =>
  button(
    { className: classes, onclick: () => isActive.update((v) => !v) },
    'Toggle',
  );
```

- `className` accepts strings, arrays, objects, and reactive values.

---

### Lists: createReactiveList

```ts
import { createReactiveList, ul, li, button, signal } from 'thorix';

const items = signal(['Apple', 'Banana']);

const List = () =>
  div(
    button({ onclick: () => items.update((xs) => [...xs, 'Cherry']) }, 'Add'),
    createReactiveList(items, (item) => li(item)),
  );
```

- Re-renders only the container as the signal changes

---

### Forms and inputs

```ts
import { div, input, p, signal } from 'thorix';

const name = signal('');

const Form = () =>
  div(
    input({
      value: name,
      placeholder: 'Your name',
      oninput: (e) => name.set((e.target as HTMLInputElement).value),
    }),
    p(`Hello ${name}`),
  );
```

- `value`, `disabled`, `checked`, and other attributes can be reactive.

---

### Preserving state between renders

```ts
import { div, button, signal, render } from 'thorix';

const Counter = () => {
  // Keyed signal is preserved across re-renders of this component
  const count = signal(0, 'count');
  return div(
    button({ onclick: () => count.set(count.get() + 1) }, `Clicks: ${count}`),
  );
};
```

- Unkeyed signals are recreated each render; keyed signals persist.

---

### Router with loaders and navigation

```ts
import { createRouter, div, h1, p, nav, main, render } from 'thorix';

const Home = () => div(h1('Home'));
const User = (data: { id: string; name: string }) =>
  div(h1(`User: ${data.name}`));

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    {
      path: '/users/:id',
      loader: async (params) => ({ id: params.id, name: `User ${params.id}` }),
      component: User,
      errorBoundary: (err) => div(p('Error: ', err.message)),
    },
  ],
});
```

- Loaders fetch before render; errors are handled per-route.

---

### The `component` Function

Thorix provides a `component` function that creates reactive components that automatically re-render when their dependencies change.

```ts
import { component, div, button, p, signal, computed } from 'thorix';

const SimpleCounter = component(() => {
  const count = signal(0);

  return div(
    { className: 'counter' },
    p(`Count: ${count}`),
    button({ onclick: () => count.set(count.get() + 1) }, 'Increment'),
  );
});
```

**Key Benefits:**

- **Automatic Re-rendering**: Components update when signals change
- **Type Safety**: Full TypeScript support
- **State Preservation**: Signals maintain state between renders

---

### Component with Typed Props

```ts
type CounterProps = {
  initialValue?: number;
  label?: string;
  onIncrement?: (value: number) => void;
};

const Counter = component<CounterProps>(
  ({ initialValue = 0, label = 'Counter', onIncrement }) => {
    const count = signal(initialValue);
    const doubled = computed(() => count.get() * 2);

    const handleClick = () => {
      const newValue = count.get() + 1;
      count.set(newValue);
      onIncrement?.(newValue);
    };

    return div(
      { className: 'counter' },
      p(`${label}: ${count}`),
      p(`Doubled: ${doubled}`),
      button({ onclick: handleClick }, 'Increment'),
    );
  },
);
```

**Usage:**

```ts
const App = component(() =>
  div(
    Counter({ initialValue: 10, label: 'Clicks' }),
    Counter({ initialValue: 0, label: 'Steps' }),
  ),
);
```

---

### Async Signal Updates with Pending State

```ts
import { component, div, button, p, span, signal, effect } from 'thorix';

const UserProfile = component(() => {
  const user = signal<{ name: string; email: string } | null>(null);
  const isLoading = signal(false);
  const error = signal<string | null>(null);

  const loadUser = async () => {
    isLoading.set(true);
    error.set(null);

    try {
      const userData = await fetchUser('1');
      user.set(userData);
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      isLoading.set(false);
    }
  };
```

---

### Async State Management (continued)

```ts
  // Auto-load on mount
  effect(() => {
    loadUser();
  });

  return div(
    { className: 'user-profile' },
    button(
      {
        onclick: loadUser,
        disabled: isLoading.get(),
        className: isLoading.get() ? 'loading' : '',
      },
      isLoading.get() ? 'Loading...' : 'Refresh User',
    ),

    // Show loading state
    isLoading.get() &&
      div({ className: 'loading-spinner' }, span('Loading user data...')),

    // Show error state
    error.get() && div({ className: 'error' }, p(`Error: ${error.get()}`)),

    // Show user data
    user.get() &&
      div(
        { className: 'user-data' },
        p(`Name: ${user.get()?.name}`),
        p(`Email: ${user.get()?.email}`),
      ),
  );
});
```

**Key Benefits:**

- **Loading States**: Track async operations
- **UI Disabling**: Disable buttons during loading
- **Error Handling**: Graceful error display

---

### Advanced Component Patterns

```ts
import { component, div, button, p, signal, computed, effect } from 'thorix';

// Custom hook pattern for reusable logic
const useCounter = (initialValue = 0) => {
  const count = signal(initialValue);
  const isEven = computed(() => count.get() % 2 === 0);

  const increment = () => count.set(count.get() + 1);
  const decrement = () => count.set(count.get() - 1);
  const reset = () => count.set(initialValue);

  return { count, isEven, increment, decrement, reset };
};
```

**Benefits:**

- **Reusability**: Logic shared across components
- **Maintainability**: Clear separation of concerns
- **Performance**: Only affected parts update

---

### Advanced Patterns (continued)

```ts
// Component using custom hook
const AdvancedCounter = component(() => {
  const { count, isEven, increment, decrement, reset } = useCounter(5);

  // Side effect for logging
  effect(() => {
    console.log(`Count changed to ${count.get()}, isEven: ${isEven.get()}`);
  });

  return div(
    { className: 'advanced-counter' },
    p(`Count: ${count}`),
    p(`Even: ${isEven.get() ? 'Yes' : 'No'}`),
    div(
      { className: 'controls' },
      button({ onclick: decrement }, '-'),
      button({ onclick: increment }, '+'),
      button({ onclick: reset }, 'Reset'),
    ),
  );
});
```

---

### Reactive Lists

```ts
const TodoList = component(() => {
  const todos = signal([
    { id: 1, text: 'Learn Thorix', completed: false },
    { id: 2, text: 'Build app', completed: false },
  ]);

  const completedCount = computed(
    () => todos.get().filter((todo) => todo.completed).length,
  );

  const toggleTodo = (id: number) => {
    todos.update((todoList) =>
      todoList.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  return div(
    { className: 'todo-list' },
    p(`Completed: ${completedCount} / ${todos.get().length}`),
    ...todos.get().map((todo) =>
      div(
        {
          key: todo.id,
          className: todo.completed ? 'completed' : '',
          onclick: () => toggleTodo(todo.id),
        },
        p(todo.text),
      ),
    ),
  );
});
```

---

### Router Usage

```ts
const App = () =>
  div(
    nav(
      router.link({ to: '/', children: 'Home' }),
      ' | ',
      router.link({ to: '/users/1', children: 'User 1' }),
    ),
    main(router.View()),
  );

render(App, document.getElementById('app')!);
```

---

### Safety and Performance

- **Infinite loop protection** in effects and DOM bindings
- **Batching** to minimize redundant work
- **Fine-grained updates** instead of whole-component re-renders
- **Zero dependency**, TypeScript-first API with strongly typed props

---

### Try it

- Explore `examples/` in this repo
- Import from `thorix` and build components in pure TypeScript
- Render with `render(Component, container)`

---

### 🎉 You're Ready to Thorix!

**Remember:**

- No more `useEffect` dependency nightmares
- No more virtual DOM reconciliation mysteries
- No more JSX transformation headaches
- Just pure, reactive TypeScript fun!

**When someone asks "Why not just use React?"**

> "Work smarter not harder!" ✨

**Thanks for listening!** 🚀
