/**
 * @fileoverview Tests for the router component.
 *
 * This module tests the router functionality including:
 * - Route matching and navigation
 * - Loaders and data fetching
 * - Browser back/forward navigation
 * - URL parameters and search params
 * - Error handling
 */

import { createRouter, Router } from './router';
import { div, h1, p } from './reactive-dom';

// Mock DOM environment for testing
const mockLocation = {
  pathname: '/',
  search: '',
  href: 'http://localhost/',
};

const mockHistory = {
  pushState: jest.fn(),
  replaceState: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

// Mock window object
beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  mockLocation.pathname = '/';
  mockLocation.search = '';
  mockLocation.href = 'http://localhost/';

  // Mock window properties by directly assigning
  (window as any).location = mockLocation;
  (window as any).history = mockHistory;
  (window as any).addEventListener = jest.fn();
});

describe('Router', () => {
  let router: Router;

  // Simple test components
  const HomeComponent = () => div({}, h1({}, 'Home'));
  const UsersComponent = () => div({}, h1({}, 'Users'));
  const UserDetailComponent = () => div({}, h1({}, 'User Detail'));
  const PostsComponent = () => div({}, h1({}, 'Posts'));
  const PostDetailComponent = () => div({}, h1({}, 'Post Detail'));
  const SearchComponent = () => div({}, h1({}, 'Search'));
  const NotFoundComponent = () => div({}, h1({}, 'Not Found'));

  // Mock loaders
  const mockUsersLoader = jest.fn().mockResolvedValue([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]);

  const mockUserLoader = jest.fn().mockImplementation(async params => {
    if (params.id === '1') {
      return { id: 1, name: 'Alice', email: 'alice@example.com' };
    }
    throw new Error('User not found');
  });

  const mockPostsLoader = jest.fn().mockResolvedValue([
    { id: 1, title: 'First Post' },
    { id: 2, title: 'Second Post' },
  ]);

  const mockPostLoader = jest.fn().mockImplementation(async params => {
    if (params.id === '1') {
      return { id: 1, title: 'First Post', content: 'Post content' };
    }
    throw new Error('Post not found');
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockLocation.pathname = '/';
    mockLocation.search = '';
    mockLocation.href = 'http://localhost/';

    // Create router instance
    router = createRouter({
      routes: [
        {
          path: '/',
          component: HomeComponent,
        },
        {
          path: '/users',
          component: UsersComponent,
          loader: mockUsersLoader,
        },
        {
          path: '/users/:id',
          component: UserDetailComponent,
          loader: mockUserLoader,
        },
        {
          path: '/posts',
          component: PostsComponent,
          loader: mockPostsLoader,
        },
        {
          path: '/posts/:id',
          component: PostDetailComponent,
          loader: mockPostLoader,
        },
        {
          path: '/search',
          component: SearchComponent,
        },
      ],
      notFoundComponent: NotFoundComponent,
    });
  });

  describe('Route matching', () => {
    test('should match exact routes', () => {
      const route = router['findRoute']('/users');
      expect(route).toBeDefined();
      expect(route?.path).toBe('/users');
    });

    test('should match routes with parameters', () => {
      const route = router['findRoute']('/users/1');
      expect(route).toBeDefined();
      expect(route?.path).toBe('/users/:id');
    });

    test('should return null for non-matching routes', () => {
      const route = router['findRoute']('/nonexistent');
      expect(route).toBeNull();
    });

    test('should parse URL parameters correctly', () => {
      const params = router['parseParams']('/users/123', '/users/:id');
      expect(params).toEqual({ id: '123' });
    });

    test('should parse multiple URL parameters', () => {
      const params = router['parseParams'](
        '/users/123/posts/456',
        '/users/:userId/posts/:postId'
      );
      expect(params).toEqual({ userId: '123', postId: '456' });
    });
  });

  describe('Navigation', () => {
    test('should navigate to a new route', async () => {
      await router.navigate('/users');

      const state = router.getState();
      expect(state.currentPath).toBe('/users');
      expect(state.isLoading).toBe(false);
      expect(state.data).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });

    test('should handle loader errors', async () => {
      // Mock a failing loader
      const failingLoader = jest
        .fn()
        .mockRejectedValue(new Error('Loader failed'));

      const testRouter = createRouter({
        routes: [
          {
            path: '/test',
            component: () => div({}, 'Test'),
            loader: failingLoader,
          },
        ],
      });

      await testRouter.navigate('/test');

      const state = testRouter.getState();
      expect(state.error).toBeDefined();
      expect(state.error?.message).toBe('Loader failed');
      expect(state.isLoading).toBe(false);
    });

    test('should update browser URL on navigation', async () => {
      await router.navigate('/users');

      expect(mockHistory.pushState).toHaveBeenCalledWith(null, '', '/users');
    });
  });

  describe('Browser history', () => {
    test('should handle back navigation', async () => {
      // Navigate to multiple routes
      await router.navigate('/users');
      await router.navigate('/posts');

      // Go back
      router.back();

      const state = router.getState();
      expect(state.currentPath).toBe('/users');
    });

    test('should handle forward navigation', async () => {
      // Navigate to multiple routes
      await router.navigate('/users');
      await router.navigate('/posts');

      // Go back
      router.back();

      // Go forward
      router.forward();

      const state = router.getState();
      expect(state.currentPath).toBe('/posts');
    });

    test('should track navigation state correctly', async () => {
      expect(router.canGoBack()).toBe(false);
      expect(router.canGoForward()).toBe(false);

      await router.navigate('/users');
      expect(router.canGoBack()).toBe(true);
      expect(router.canGoForward()).toBe(false);

      await router.navigate('/posts');
      expect(router.canGoBack()).toBe(true);
      expect(router.canGoForward()).toBe(false);

      router.back();
      expect(router.canGoBack()).toBe(false);
      expect(router.canGoForward()).toBe(true);
    });
  });

  describe('Search parameters', () => {
    test('should parse search parameters correctly', () => {
      // Mock URL with search params
      mockLocation.search = '?q=test&filter=recent';

      const search = router['parseSearch']();
      expect(search).toEqual({
        q: 'test',
        filter: 'recent',
      });
    });

    test('should handle empty search parameters', () => {
      mockLocation.search = '';

      const search = router['parseSearch']();
      expect(search).toEqual({});
    });
  });

  describe('Link component', () => {
    test('should create a link that navigates on click', () => {
      const link = router.Link({
        to: '/users',
        children: 'Users',
      });

      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBe('/users');
      expect(link.textContent).toBe('Users');
    });

    test('should prevent default and navigate on click', () => {
      const link = router.Link({
        to: '/users',
        children: 'Users',
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      };

      // Simulate click
      const clickHandler = link.onclick;
      if (clickHandler) {
        clickHandler(mockEvent as any);
      }

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('View component', () => {
    test('should render loading state', () => {
      // Set loading state
      router.state.set({
        ...router.getState(),
        isLoading: true,
      });

      const view = router.View();
      expect(view.textContent).toContain('Loading');
    });

    test('should render error state', () => {
      // Set error state
      router.state.set({
        ...router.getState(),
        error: new Error('Test error'),
      });

      const view = router.View();
      expect(view.textContent).toContain('Error: Test error');
    });

    test('should render route component', () => {
      // Set current route
      router['currentRoute'].set({
        path: '/',
        component: HomeComponent,
      });

      const view = router.View();
      expect(view.querySelector('h1')?.textContent).toBe('Home');
    });

    test('should render not found component', () => {
      // Set no current route
      router['currentRoute'].set(null);

      const view = router.View();
      expect(view.textContent).toContain('Page not found');
    });
  });

  describe('Router configuration', () => {
    test('should handle base path correctly', () => {
      const routerWithBase = createRouter({
        routes: [
          {
            path: '/',
            component: HomeComponent,
          },
        ],
        basePath: '/app',
      });

      expect(routerWithBase['basePath']).toBe('/app');
    });

    test('should handle default route', () => {
      const routerWithDefault = createRouter({
        routes: [
          {
            path: '/',
            component: HomeComponent,
          },
        ],
        defaultRoute: '/home',
      });

      expect(routerWithDefault['defaultRoute']).toBe('/home');
    });
  });

  describe('Error boundaries', () => {
    test('should use error boundary when available', () => {
      const errorBoundary = jest.fn().mockReturnValue(div({}, 'Error handled'));

      const routerWithErrorBoundary = createRouter({
        routes: [
          {
            path: '/test',
            component: () => div({}, 'Test'),
            errorBoundary,
          },
        ],
      });

      // Set error state
      routerWithErrorBoundary.state.set({
        ...routerWithErrorBoundary.getState(),
        error: new Error('Test error'),
      });

      const view = routerWithErrorBoundary.View();
      expect(errorBoundary).toHaveBeenCalled();
      expect(view.textContent).toBe('Error handled');
    });
  });
});
