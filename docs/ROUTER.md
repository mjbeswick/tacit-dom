# Router Documentation

The reactive-dom router provides a powerful client-side routing solution with loaders, browser navigation support, and seamless integration with the reactive-dom library.

## Features

- **Route Loaders**: Fetch data before rendering components
- **Browser Navigation**: Full support for back/forward buttons
- **URL Parameters**: Dynamic route parameters with `:param` syntax
- **Search Parameters**: Automatic parsing of URL search params
- **Error Boundaries**: Custom error handling per route
- **Loading States**: Built-in loading indicators
- **TypeScript Support**: Full type safety with TypeScript

## Basic Usage

```typescript
import { router, link, history } from 'reactive-dom';

// Use in your app
const App = () => {
  return div(
    nav(link({ to: '/', children: 'Home' })),
    main(
      router({
        routes: [
          {
            path: '/',
            component: () => div(h1('Home')),
          },
          {
            path: '/users',
            component: (data) =>
              div(
                h1('Users'),
                data.users.map((user) => div(user)),
              ),
            loader: async () => {
              // Fetch users data
              return await fetch('/api/users').then((r) => r.json());
            },
          },
        ],
      }),
    ),
  );
};
```

## Route Configuration

### Route Object

```typescript
type Route = {
  path: string; // URL path pattern
  component: (data?: any) => HTMLElement; // Component to render
  loader?: (params: RouteParams, search: RouteSearch) => Promise<any> | any;
  errorBoundary?: (error: Error) => HTMLElement;
};
```

### Router Configuration

```typescript
type RouterConfig = {
  routes: Route[];
  basePath?: string; // Optional base path (e.g., '/app')
  defaultRoute?: string; // Default route if none matches
  notFoundComponent?: () => HTMLElement;
};
```

## Route Patterns

### Static Routes

```typescript
{ path: '/about', component: AboutPage }
```

### Dynamic Routes

```typescript
{ path: '/users/:id', component: UserDetailPage }
```

### Multiple Parameters

```typescript
{ path: '/users/:userId/posts/:postId', component: PostDetailPage }
```

## Loaders

Loaders are functions that run before a route component is rendered. They can fetch data, validate parameters, or perform any async operations.

```typescript
{
  path: '/users/:id',
  component: UserDetailPage,
  loader: async (params, search) => {
    const user = await fetch(`/api/users/${params.id}`).then(r => r.json());
    if (!user) throw new Error('User not found');
    return user;
  },
}
```

### Loader Parameters

- `params`: URL parameters (e.g., `{ id: '123' }`)
- `search`: Search parameters (e.g., `{ q: 'search term' }`)

### Error Handling

Loaders can throw errors which will be caught by the router:

```typescript
loader: async (params) => {
  const user = await fetchUser(params.id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
```

## Error Boundaries

Each route can have a custom error boundary:

```typescript
{
  path: '/users/:id',
  component: UserDetailPage,
  loader: async (params) => {
    // This might throw an error
    return await fetchUser(params.id);
  },
  errorBoundary: (error) => {
    return div(
      { className: 'error-page' },
      h2( 'Something went wrong'),
      p( error.message),
      link({ to: '/users', children: 'Back to Users' })
    );
  },
}
```

## Navigation

### Programmatic Navigation

```typescript
// Navigate to a new route
await router.navigate('/users/123');

// Go back in browser history
history.back();

// Go forward in browser history
history.forward();

// Check if navigation is possible
if (history.canGoBack()) {
  history.back();
}
```

### Link Component

```typescript
// Basic link
link({ to: '/users', children: 'Users' });

// With additional props
link({
  to: '/users/123',
  className: 'user-link',
  children: 'View User',
});
```

## Router State

The router maintains reactive state that you can subscribe to:

```typescript
const state = router.getState();
console.log(state.currentPath); // Current URL path
console.log(state.params); // URL parameters
console.log(state.search); // Search parameters
console.log(state.data); // Loader data
console.log(state.error); // Current error (if any)
console.log(state.isLoading); // Loading state
```

### Subscribing to State Changes

```typescript
router.state.subscribe(() => {
  const state = router.getState();
  console.log('Route changed to:', state.currentPath);
});
```

## Browser History Integration

The router automatically integrates with browser history:

- **Push State**: New navigations add to history
- **Pop State**: Browser back/forward buttons work
- **URL Updates**: Browser URL stays in sync
- **History Stack**: Tracks navigation history

## Advanced Features

### Base Path

Serve your app from a subdirectory:

```typescript
const routerInstance = router({
  routes: [...],
  basePath: '/app',  // App will be served from /app/
});
```

### Default Route

Redirect to a default route when no route matches:

```typescript
const routerInstance = router({
  routes: [...],
  defaultRoute: '/home',
});
```

### Not Found Component

Custom 404 page:

```typescript
const routerInstance = router({
  routes: [...],
  notFoundComponent: () =>
    div( h1( '404 - Page Not Found')),
});
```

## Complete Example

```typescript
import { router, link, history } from './src/index.js';
import { div, h1, p, nav, main } from './src/index.js';

// Mock API
const api = {
  async getUsers() {
    return [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
  },
  async getUser(id: string) {
    const users = await this.getUsers();
    const user = users.find((u) => u.id === parseInt(id));
    if (!user) throw new Error('User not found');
    return user;
  },
};

// Components
const HomePage = () => div(h1('Welcome Home'));
const NotFoundPage = () => div(h1('Page Not Found'));

const UsersPage = (data) => {
  const users = data.users;

  return div(
    h1('Users'),
    ...users.map((user) =>
      div(
        { key: user.id },
        p(user.name),
        link({ to: `/users/${user.id}`, children: 'View' }),
      ),
    ),
  );
};

const UserDetailPage = (data) => {
  const user = data;

  return div(
    h1(`User: ${user.name}`),
    p(`ID: ${user.id}`),
    link({ to: '/users', children: '← Back' }),
  );
};

// Main app
const App = () => {
  return div(
    nav(
      link({ to: '/', children: 'Home' }),
      link({ to: '/users', children: 'Users' }),
    ),
    main(
      router({
        routes: [
          {
            path: '/',
            component: HomePage,
          },
          {
            path: '/users',
            component: UsersPage,
            loader: async () => await api.getUsers(),
          },
          {
            path: '/users/:id',
            component: UserDetailPage,
            loader: async (params) => await api.getUser(params.id),
            errorBoundary: (error) => div(h2('Error'), p(error.message)),
          },
        ],
        notFoundComponent: NotFoundPage,
      }),
    ),
  );
};

export default App;
```

## Testing

The router is fully testable with comprehensive test coverage:

```typescript
import { createRouter } from './src/router';

test('should navigate and load data', async () => {
  const routerInstance = createRouter({
    routes: [
      {
        path: '/test',
        component: () => div('Test'),
        loader: async () => ({ data: 'test' }),
      },
    ],
  });

  await routerInstance.navigate('/test');

  const state = routerInstance.getState();
  expect(state.currentPath).toBe('/test');
  expect(state.data).toEqual({ data: 'test' });
});
```

## Best Practices

1. **Use Loaders for Data Fetching**: Keep components focused on rendering
2. **Handle Errors Gracefully**: Always provide error boundaries
3. **Use TypeScript**: Get full type safety for routes and loaders
4. **Subscribe to State**: React to route changes when needed
5. **Test Your Routes**: Ensure loaders and navigation work correctly
6. **Use Meaningful URLs**: Design URLs that make sense to users
7. **Handle Loading States**: Provide feedback during data fetching

## Migration from Other Routers

The reactive-dom router is designed to be familiar to users of other routing libraries:

- **React Router**: Similar API with loaders and error boundaries
- **Vue Router**: Similar route configuration patterns
- **Angular Router**: Similar parameter and search param handling

The main difference is the tight integration with reactive-dom's reactive primitives and DOM creation utilities.
