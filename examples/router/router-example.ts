/**
 * @fileoverview Router example demonstrating loaders, browser back navigation, and all router features.
 *
 * This example shows how to use the reactive-dom router with:
 * - Route loaders for data fetching
 * - Browser back/forward navigation
 * - URL parameters
 * - Search parameters
 * - Error boundaries
 * - Loading states
 */

import {
  signal,
  computed,
  div,
  button,
  span,
  h1,
  h2,
  h3,
  p,
  nav,
  header,
  footer,
  main,
  router,
} from 'reactive-dom';

// Mock API functions for demonstration
const mockApi = {
  async getUsers() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
      { id: 3, name: 'Charlie', email: 'charlie@example.com' },
    ];
  },

  async getUser(id: string) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = await this.getUsers();
    const user = users.find(u => u.id === parseInt(id));
    if (!user) throw new Error(`User ${id} not found`);
    return user;
  },

  async getPosts() {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return [
      {
        id: 1,
        title: 'First Post',
        author: 'Alice',
        content: 'This is the first post...',
      },
      {
        id: 2,
        title: 'Second Post',
        author: 'Bob',
        content: 'This is the second post...',
      },
      {
        id: 3,
        title: 'Third Post',
        author: 'Charlie',
        content: 'This is the third post...',
      },
    ];
  },

  async getPost(id: string) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const posts = await this.getPosts();
    const post = posts.find(p => p.id === parseInt(id));
    if (!post) throw new Error(`Post ${id} not found`);
    return post;
  },
};

// Create reactive state for navigation
const navigationState = signal({
  canGoBack: false,
  canGoForward: false,
});

// Update navigation state based on browser history
const updateNavigationState = () => {
  navigationState.set({
    canGoBack: window.history.length > 1,
    canGoForward: false, // This would need more complex logic to track forward state
  });
};

// Listen for popstate events
window.addEventListener('popstate', updateNavigationState);
updateNavigationState(); // Initial state

// Home page component
const HomePage = () => {
  return div(
    { className: 'page home-page' },
    h1({}, 'Welcome to Reactive Router Demo'),
    p(
      {},
      'This example demonstrates the router with loaders and browser navigation.'
    ),

    div(
      { className: 'feature-list' },
      h3({}, 'Features:'),
      div(
        { className: 'feature-item' },
        span({ className: 'feature-icon' }, '🔄'),
        span({}, 'Route loaders for data fetching')
      ),
      div(
        { className: 'feature-item' },
        span({ className: 'feature-icon' }, '⬅️➡️'),
        span({}, 'Browser back/forward navigation')
      ),
      div(
        { className: 'feature-item' },
        span({ className: 'feature-icon' }, '🔗'),
        span({}, 'URL parameters and search params')
      ),
      div(
        { className: 'feature-item' },
        span({ className: 'feature-icon' }, '⚠️'),
        span({}, 'Error boundaries')
      ),
      div(
        { className: 'feature-item' },
        span({ className: 'feature-icon' }, '⏳'),
        span({}, 'Loading states')
      )
    ),

    div(
      { className: 'navigation-demo' },
      h3({}, 'Try these routes:'),
      div(
        { className: 'route-links' },
        Link(router, {
          to: '/users',
          className: 'route-link',
          children: '👥 Users',
        }),
        Link(router, {
          to: '/posts',
          className: 'route-link',
          children: '📝 Posts',
        }),
        Link(router, {
          to: '/users/1',
          className: 'route-link',
          children: '👤 User 1',
        }),
        Link(router, {
          to: '/posts/2',
          className: 'route-link',
          children: '📄 Post 2',
        }),
        Link(router, {
          to: '/search?q=test',
          className: 'route-link',
          children: '🔍 Search',
        })
      )
    )
  );
};

// Users list page component
const UsersPage = () => {
  const state = router.getState();
  const users = state.data;

  return div(
    { className: 'page users-page' },
    h1({}, 'Users'),
    p({}, 'This page demonstrates a loader that fetches data.'),

    div(
      { className: 'users-list' },
      ...users.map((user: any) =>
        div(
          { key: user.id, className: 'user-item' },
          h3({}, user.name),
          p({}, user.email),
          Link(router, {
            to: `/users/${user.id}`,
            className: 'user-link',
            children: 'View Details',
          })
        )
      )
    )
  );
};

// User detail page component
const UserDetailPage = () => {
  const state = router.getState();
  const user = state.data;
  const { id } = state.params;

  return div(
    { className: 'page user-detail-page' },
    h1({}, `User: ${user.name}`),
    p({}, `ID: ${id}`),
    p({}, `Email: ${user.email}`),

    div(
      { className: 'user-actions' },
      Link(router, {
        to: '/users',
        className: 'back-link',
        children: '← Back to Users',
      }),
      Link(router, {
        to: '/posts',
        className: 'nav-link',
        children: 'View Posts',
      })
    )
  );
};

// Posts list page component
const PostsPage = () => {
  const state = router.getState();
  const posts = state.data;

  return div(
    { className: 'page posts-page' },
    h1({}, 'Posts'),
    p({}, 'This page demonstrates a loader that fetches posts data.'),

    div(
      { className: 'posts-list' },
      ...posts.map((post: any) =>
        div(
          { key: post.id, className: 'post-item' },
          h3({}, post.title),
          p({}, `By: ${post.author}`),
          p({}, post.content),
          Link(router, {
            to: `/posts/${post.id}`,
            className: 'post-link',
            children: 'Read More',
          })
        )
      )
    )
  );
};

// Post detail page component
const PostDetailPage = () => {
  const state = router.getState();
  const post = state.data;
  const { id } = state.params;

  return div(
    { className: 'page post-detail-page' },
    h1({}, post.title),
    p({}, `ID: ${id}`),
    p({}, `Author: ${post.author}`),
    div({ className: 'post-content' }, p({}, post.content)),

    div(
      { className: 'post-actions' },
      Link(router, {
        to: '/posts',
        className: 'back-link',
        children: '← Back to Posts',
      }),
      Link(router, {
        to: '/users',
        className: 'nav-link',
        children: 'View Users',
      })
    )
  );
};

// Search page component
const SearchPage = () => {
  const state = router.getState();
  const { q } = state.search;

  return div(
    { className: 'page search-page' },
    h1({}, 'Search Results'),
    p({}, `Searching for: "${q}"`),

    div(
      { className: 'search-results' },
      p({}, 'This demonstrates URL search parameters.'),
      p({}, 'Try changing the URL to see different search terms.'),
      p({}, 'Example: /search?q=react&filter=recent')
    ),

    div(
      { className: 'search-actions' },
      Link(router, {
        to: '/',
        className: 'back-link',
        children: '← Back to Home',
      }),
      Link(router, {
        to: '/search?q=test',
        className: 'nav-link',
        children: 'Search for "test"',
      }),
      Link(router, {
        to: '/search?q=router',
        className: 'nav-link',
        children: 'Search for "router"',
      })
    )
  );
};

// Error boundary component
const ErrorBoundary = (error: Error) => {
  return div(
    { className: 'error-boundary' },
    h2({}, 'Something went wrong'),
    p({}, error.message),
    div(
      { className: 'error-actions' },
      Link(router, { to: '/', className: 'error-link', children: 'Go Home' }),
      button(
        {
          className: 'retry-button',
          onClick: () => window.location.reload(),
        },
        'Retry'
      )
    )
  );
};

// Not found component
const NotFoundPage = () => {
  return div(
    { className: 'page not-found-page' },
    h1({}, '404 - Page Not Found'),
    p({}, 'The page you are looking for does not exist.'),
    Link(router, { to: '/', className: 'home-link', children: 'Go Home' })
  );
};

// Navigation component
const Navigation = () => {
  return nav(
    { className: 'main-navigation' },
    div(
      { className: 'nav-links' },
      a({ href: '/router/', className: 'nav-link' }, '🏠 Home'),
      a({ href: '/router/users', className: 'nav-link' }, '👥 Users'),
      a({ href: '/router/posts', className: 'nav-link' }, '📝 Posts'),
      a({ href: '/router/search?q=demo', className: 'nav-link' }, '🔍 Search')
    ),

    div(
      { className: 'browser-nav' },
      button(
        {
          className: 'nav-button',
          disabled: !navigationState.get().canGoBack,
          onClick: () => window.history.back(),
        },
        '⬅️ Back'
      ),
      button(
        {
          className: 'nav-button',
          disabled: !navigationState.get().canGoForward,
          onClick: () => window.history.forward(),
        },
        'Forward ➡️'
      )
    )
  );
};

// Define routes for the router
const routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/users',
    component: UsersPage,
    loader: async () => {
      return await mockApi.getUsers();
    },
    errorBoundary: ErrorBoundary,
  },
  {
    path: '/users/:id',
    component: UserDetailPage,
    loader: async params => {
      return await mockApi.getUser(params.id);
    },
    errorBoundary: ErrorBoundary,
  },
  {
    path: '/posts',
    component: PostsPage,
    loader: async () => {
      return await mockApi.getPosts();
    },
    errorBoundary: ErrorBoundary,
  },
  {
    path: '/posts/:id',
    component: PostDetailPage,
    loader: async params => {
      return await mockApi.getPost(params.id);
    },
    errorBoundary: ErrorBoundary,
  },
  {
    path: '/search',
    component: SearchPage,
  },
];

// Main app component
const RouterApp = () => {
  return div(
    { className: 'router-app' },
    header(
      { className: 'app-header' },
      h1({ className: 'app-title' }, 'Reactive Router Demo'),
      Navigation()
    ),

    main(
      { className: 'app-main' },
      router({
        routes,
        basePath: '/router',
        notFoundComponent: NotFoundPage,
      })
    ),

    footer(
      { className: 'app-footer' },
      p({}, 'Reactive Router with Loaders and Browser Navigation'),
      p({}, 'Current path: ', window.location.pathname)
    )
  );
};

// Export the app component
export default RouterApp;
