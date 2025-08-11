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
  const count = signal(0, 'count'); // preserves between renders
  const doubled = computed(() => count.get() * 2);

  return div(
    { className: 'app' },
    p(`Count: ${count}`),
    p(`Doubled: ${doubled}`),
    button({ onclick: () => count.set(count.get() + 1) }, 'Increment'),
  );
};

const root = document.getElementById('app')!;
render(App, root);
```

- Pass reactive values directly; text updates automatically.
- `onclick` and other DOM events are supported.

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
    // Re-renders only the container as the signal changes
    createReactiveList(items, (item) => li(item)),
  );
```

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

### Rendering and cleanup

```ts
import { div, p, render, cleanup } from 'thorix';

const App = () => div(p('Mounted'));
const root = document.getElementById('app')!;
render(App, root);

// Later
cleanup(root); // Cleans subscriptions from elements inside root
```

- Automatic subscription tracking prevents leaks; manual `cleanup` is available.

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

render(Counter, document.getElementById('app')!);
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

- Loaders fetch before render; errors are handled per-route.

---

### Safety and performance

- Infinite loop protection in effects and DOM bindings
- Batching to minimize redundant work
- Fine-grained updates instead of whole-component re-renders
- Zero dependency, TypeScript-first API with strongly typed props

---

### The Bottom Line: Thorix vs React

**Thorix Approach:**

- 🎯 **Granular Updates**: Only affected DOM elements update
- 🧠 **Simple Mental Model**: Signals, computed, effects - that's it
- 🚀 **Direct DOM**: No virtual DOM overhead or reconciliation
- 🌍 **Global State**: Create state anywhere, no providers needed

**React Approach:**

- 🔄 **Component Re-renders**: Entire components re-render for small changes
- 🪝 **Hook Complexity**: useState, useEffect, dependency arrays to manage
- 🏗️ **Provider Hell**: Context, providers, and complex state patterns
- 🎭 **Virtual DOM**: Reconciliation and diffing overhead

**Choose wisely:** Use the smallest tool that gets the job done.

---

### Try it

- Explore `examples/` in this repo
- Import from `thorix` and build components in pure TypeScript
- Render with `render(Component, container)`

Thanks!
