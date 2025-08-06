/**
 * @fileoverview Router component for the reactive-dom library.
 *
 * This module provides a router component with loaders and browser back navigation support.
 * It integrates with the reactive-dom library's reactive primitives and DOM creation utilities.
 *
 * @module router
 */

import { signal, Signal, Computed } from './reactivity';
import { div, a } from './reactive-dom';
import { computed } from './reactivity';

// Types for the router
export type RouteParams = Record<string, string>;
export type RouteSearch = Record<string, string>;

export type Route = {
  path: string;
  component: (data?: any) => HTMLElement;
  loader?: (_params: RouteParams, _search: RouteSearch) => Promise<any> | any;
  errorBoundary?: (_error: Error) => HTMLElement;
};

export type RouterState = {
  currentPath: string;
  params: RouteParams;
  search: RouteSearch;
  data: any;
  error: Error | null;
  isLoading: boolean;
};

export type RouterConfig = {
  routes: Route[];
  basePath?: string;
  defaultRoute?: string;
  notFoundComponent?: () => HTMLElement;
};

// Global router instance
let globalRouter: Router | null = null;

/**
 * Router class that manages navigation, loaders, and browser history
 */
export class Router {
  private routes: Route[];
  private basePath: string;
  private defaultRoute: string;
  private notFoundComponent: (() => HTMLElement) | undefined;

  // Reactive state
  public state: Signal<RouterState>;
  private currentRoute: Signal<Route | null>;
  private historyStack: Signal<string[]>;
  private currentIndex: Signal<number>;

  constructor(config: RouterConfig) {
    this.routes = config.routes;
    this.basePath = config.basePath || '';
    this.defaultRoute = config.defaultRoute || '/';
    this.notFoundComponent = config.notFoundComponent;

    // Initialize reactive state
    this.state = signal<RouterState>({
      currentPath: '',
      params: {},
      search: {},
      data: null,
      error: null,
      isLoading: false,
    });

    this.currentRoute = signal<Route | null>(null);
    this.historyStack = signal<string[]>([]);
    this.currentIndex = signal<number>(-1);

    // Set as global router
    globalRouter = this;

    // Initialize router
    this.initialize();
  }

  /**
   * Initialize the router and set up browser history listeners
   */
  private initialize(): void {
    // Set up popstate listener for browser back/forward
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', (_event) => {
        const path = this.getPathFromUrl();
        this.navigateToPath(path, false);
      });

      // Set initial route
      const initialPath = this.getPathFromUrl() || this.defaultRoute;
      this.navigateToPath(initialPath, false);
    }
  }

  /**
   * Get the current path from the URL
   */
  private getPathFromUrl(): string {
    if (typeof window === 'undefined') return '/';

    const path = window.location.pathname;
    return path.startsWith(this.basePath)
      ? path.slice(this.basePath.length) || '/'
      : path;
  }

  /**
   * Update the browser URL without triggering navigation
   */
  private updateUrl(path: string, replace: boolean = false): void {
    if (typeof window === 'undefined') return;

    const fullPath = this.basePath + path;
    if (replace) {
      window.history.replaceState(null, '', fullPath);
    } else {
      window.history.pushState(null, '', fullPath);
    }
  }

  /**
   * Parse URL parameters from a path
   */
  private parseParams(path: string, routePath: string): RouteParams {
    const params: RouteParams = {};
    const pathSegments = path.split('/').filter(Boolean);
    const routeSegments = routePath.split('/').filter(Boolean);

    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      const pathSegment = pathSegments[i];

      if (routeSegment.startsWith(':')) {
        const paramName = routeSegment.slice(1);
        params[paramName] = pathSegment || '';
      }
    }

    return params;
  }

  /**
   * Parse search parameters from URL
   */
  private parseSearch(): RouteSearch {
    const search: RouteSearch = {};

    if (typeof window === 'undefined') return search;

    const urlSearch = window.location.search;

    if (urlSearch) {
      const searchParams = new URLSearchParams(urlSearch);
      for (const [key, value] of searchParams.entries()) {
        search[key] = value;
      }
    }

    return search;
  }

  /**
   * Find a route that matches the given path
   */
  private findRoute(path: string): Route | null {
    return (
      this.routes.find((route) => {
        const routePathSegments = route.path.split('/').filter(Boolean);
        const pathSegments = path.split('/').filter(Boolean);

        if (routePathSegments.length !== pathSegments.length) {
          return false;
        }

        return routePathSegments.every((segment, index) => {
          return segment.startsWith(':') || segment === pathSegments[index];
        });
      }) || null
    );
  }

  /**
   * Navigate to a specific path
   */
  private async navigateToPath(
    path: string,
    updateHistory: boolean = true,
  ): Promise<void> {
    const route = this.findRoute(path);
    const search = this.parseSearch();
    const params = route ? this.parseParams(path, route.path) : {};

    // Update state to loading
    this.state.set({
      ...this.state.get(),
      currentPath: path,
      params,
      search,
      isLoading: true,
      error: null,
    });

    this.currentRoute.set(route);

    // Update history stack
    if (updateHistory) {
      const stack = this.historyStack.get();
      const currentIndex = this.currentIndex.get();

      // Remove any forward history if we're navigating to a new path
      const newStack = stack.slice(0, currentIndex + 1);
      newStack.push(path);

      this.historyStack.set(newStack);
      this.currentIndex.set(newStack.length - 1);

      // Update URL
      this.updateUrl(path, false);
    }

    try {
      let data = null;

      // Run loader if it exists
      if (route?.loader) {
        data = await route.loader(params, search);
      }

      // Update state with loaded data
      this.state.set({
        ...this.state.get(),
        data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Update state with error
      this.state.set({
        ...this.state.get(),
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Navigate to a new route
   */
  public async navigate(path: string): Promise<void> {
    await this.navigateToPath(path, true);
  }

  /**
   * Navigate back in browser history
   */
  public back(): void {
    const stack = this.historyStack.get();
    const currentIndex = this.currentIndex.get();

    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const path = stack[newIndex];
      this.currentIndex.set(newIndex);
      this.navigateToPath(path, false);
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  }

  /**
   * Navigate forward in browser history
   */
  public forward(): void {
    const stack = this.historyStack.get();
    const currentIndex = this.currentIndex.get();

    if (currentIndex < stack.length - 1) {
      const newIndex = currentIndex + 1;
      const path = stack[newIndex];
      this.currentIndex.set(newIndex);
      this.navigateToPath(path, false);
    } else if (typeof window !== 'undefined') {
      window.history.forward();
    }
  }

  /**
   * Check if back navigation is available
   */
  public canGoBack(): boolean {
    const currentIndex = this.currentIndex.get();
    if (currentIndex > 0) return true;
    if (typeof window !== 'undefined') {
      return window.history.length > 1;
    }
    return false;
  }

  /**
   * Check if forward navigation is available
   */
  public canGoForward(): boolean {
    const stack = this.historyStack.get();
    const currentIndex = this.currentIndex.get();
    if (currentIndex < stack.length - 1) return true;
    return false;
  }

  /**
   * Get the current route
   */
  public getCurrentRoute(): Route | null {
    return this.currentRoute.get();
  }

  /**
   * Get the current state
   */
  public getState(): RouterState {
    return this.state.get();
  }

  /**
   * Create a link element that navigates when clicked
   */
  public link(props: {
    to: string;
    className?: string;
    children: any;
    [key: string]: any;
  }): HTMLElement {
    const { to, className, children, ...otherProps } = props;

    return a(
      {
        href: this.basePath + to,
        className,
        onclick: (e: Event) => {
          e.preventDefault();
          this.navigate(to);
        },
        ...otherProps,
      },
      children,
    );
  }

  /**
   * Create the router view component
   */
  public View(): HTMLElement {
    const state = this.state.get();
    const route = this.currentRoute.get();

    if (state.isLoading) {
      return div({ className: 'router-loading' }, 'Loading...');
    }

    if (state.error && route?.errorBoundary) {
      return route.errorBoundary(state.error);
    }

    if (state.error) {
      return div({ className: 'router-error' }, 'Error: ', state.error.message);
    }

    if (route) {
      return route.component(state.data);
    }

    if (this.notFoundComponent) {
      return this.notFoundComponent();
    }

    return div({ className: 'router-not-found' }, 'Page not found');
  }
}

/**
 * History object for navigation
 */
export const history = {
  back: () => {
    if (globalRouter) {
      globalRouter.back();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  },
  forward: () => {
    if (globalRouter) {
      globalRouter.forward();
    } else if (typeof window !== 'undefined') {
      window.history.forward();
    }
  },
  canGoBack: () => {
    if (globalRouter) {
      return globalRouter.canGoBack();
    }
    if (typeof window !== 'undefined') {
      return window.history.length > 1;
    }
    return false;
  },
  canGoForward: () => {
    if (globalRouter) {
      return globalRouter.canGoForward();
    }
    return false;
  },
};

/**
 * Create a link component for navigation
 */
export function link(props: {
  to: string;
  className?: string;
  children: any;
  [key: string]: any;
}): HTMLElement {
  const { to, className, children, ...otherProps } = props;

  // If no global router exists yet, create a simple link that will work
  // when the router is initialized later
  if (!globalRouter) {
    return a(
      {
        href: to,
        className,
        onclick: (e: Event) => {
          e.preventDefault();
          // Try to use the router if it exists now, otherwise use window.history
          if (globalRouter) {
            globalRouter.navigate(to);
          } else if (typeof window !== 'undefined') {
            window.history.pushState(null, '', to);
            // Dispatch a popstate event to trigger router navigation
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        },
        ...otherProps,
      },
      children,
    );
  }

  return globalRouter.link(props);
}

/**
 * Create a router instance
 */
export function createRouter(config: RouterConfig): Router {
  return new Router(config);
}

/**
 * Router component that can be used directly in the component tree
 */
export function router(props: {
  routes: Route[];
  basePath?: string;
  defaultRoute?: string;
  notFoundComponent?: () => HTMLElement;
}): HTMLElement {
  const { routes, basePath, defaultRoute, notFoundComponent } = props;

  // Create router instance
  const routerInstance = new Router({
    routes,
    basePath,
    defaultRoute,
    notFoundComponent,
  });

  // Ensure the router is set as global
  globalRouter = routerInstance;

  // Create a container element
  const container = document.createElement('div');
  container.className = 'router-container';

  // Function to update the view
  const updateView = () => {
    const state = routerInstance.state.get();
    const route = routerInstance.getCurrentRoute();

    let newContent: HTMLElement;

    if (state.isLoading) {
      newContent = div({ className: 'router-loading' }, 'Loading...');
    } else if (state.error && route?.errorBoundary) {
      newContent = route.errorBoundary(state.error);
    } else if (state.error) {
      newContent = div(
        { className: 'router-error' },
        'Error: ',
        state.error.message,
      );
    } else if (route) {
      newContent = route.component(state.data);
    } else if (notFoundComponent) {
      newContent = notFoundComponent();
    } else {
      newContent = div({ className: 'router-not-found' }, 'Page not found');
    }

    // Clear container and append new content
    container.innerHTML = '';
    container.appendChild(newContent);
  };

  // Initial render
  updateView();

  // Subscribe to router state changes
  const unsubscribe = routerInstance.state.subscribe(updateView);

  // Store the subscription for cleanup (we'll need to implement this)
  // For now, we'll just store it on the container element
  (container as any)._routerUnsubscribe = unsubscribe;

  return container;
}
