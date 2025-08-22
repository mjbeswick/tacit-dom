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

import { button, div, p, render } from '../../src/index';
import { router } from '../../src/router';
import styles from './styles.module.css';

// Update navigation handlers to use the router instance
const app = () => {
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleForward = () => {
    if (typeof window !== 'undefined') {
      window.history.forward();
    }
  };

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return div(
    { className: styles.app },

    // Header section
    div(
      { className: styles.header },
      div(
        { className: styles.container },
        div(
          { className: styles.headerContent },
          div({ className: styles.title }, 'Router Example'),
          p({ className: styles.subtitle }, 'A simple router with loaders, browser navigation, and reactive state.'),
        ),
      ),
    ),

    // Navigation section
    div(
      { className: styles.nav },
      div(
        { className: styles.container },
        div(
          { className: styles.navContent },
          div(
            { className: styles.navLinks },
            div(
              {
                className: styles.navBtn,
                onClick: () => navigateTo('/'),
              },
              'Home',
            ),
            div(
              {
                className: styles.navBtn,
                onClick: () => navigateTo('/users'),
              },
              'Users',
            ),
            div(
              {
                className: styles.navBtn,
                onClick: () => navigateTo('/posts'),
              },
              'Posts',
            ),
          ),
          div(
            { className: styles.navButtons },
            button(
              {
                onClick: handleBack,
                className: styles.navBtn,
              },
              '← Back',
            ),
            button(
              {
                onClick: handleForward,
                className: styles.navBtn,
              },
              'Forward →',
            ),
          ),
        ),
      ),
    ),

    // Main content - flexible and growing
    div(
      { className: styles.main },
      div(
        { className: styles.container },
        router({
          routes: [
            {
              path: '/',
              component: () => {
                return div(
                  { className: styles.page },
                  div(
                    { className: styles.card },
                    div(
                      { className: styles.cardContent },
                      div({ className: styles.cardTitle }, 'Welcome to the Router Example'),
                      p(
                        { className: styles.pageContent },
                        'This is a simple router built with Reactive DOM. Click the navigation links above to explore different routes.',
                      ),
                      div(
                        { className: styles.pageContent },
                        div({ className: styles.cardTitle }, 'Features:'),
                        div(
                          { className: styles.pageContent },
                          div({ className: styles.pageContent }, 'Route loaders with async data fetching'),
                          div({ className: styles.pageContent }, 'Browser back/forward navigation'),
                          div({ className: styles.pageContent }, 'URL parameter parsing'),
                          div({ className: styles.pageContent }, 'Search parameter handling'),
                          div({ className: styles.pageContent }, 'Error boundaries'),
                          div({ className: styles.pageContent }, 'Loading states'),
                        ),
                      ),
                    ),
                  ),
                );
              },
            },
            {
              path: '/users',
              loader: async () => {
                // Simulate network delay
                await new Promise((resolve) => setTimeout(resolve, 500));
                return { users: ['John', 'Jane', 'Jim'] };
              },
              component: (data: any) => {
                console.log('Rendering users', data);
                return div(
                  { className: styles.page },
                  div(
                    { className: styles.card },
                    div(
                      { className: styles.cardContent },
                      div({ className: styles.cardTitle }, 'Users'),
                      p({ className: styles.pageContent }, 'Here are the users loaded from the server:'),
                      div(
                        { className: styles.userList },
                        ...data.users.map((user: string) =>
                          div({ className: styles.userItem }, div({ className: styles.userName }, user)),
                        ),
                      ),
                    ),
                  ),
                );
              },
            },
            {
              path: '/posts',
              loader: async () => {
                // Simulate network delay
                await new Promise((resolve) => setTimeout(resolve, 500));
                return { posts: ['Post 1', 'Post 2', 'Post 3'] };
              },
              component: (data: any) => {
                console.log('Rendering posts', data);
                return div(
                  { className: styles.page },
                  div(
                    { className: styles.card },
                    div(
                      { className: styles.cardContent },
                      div({ className: styles.cardTitle }, 'Posts'),
                      p({ className: styles.pageContent }, 'Here are the posts loaded from the server:'),
                      div(
                        { className: styles.postList },
                        ...data.posts.map((post: string) =>
                          div({ className: styles.postItem }, div({ className: styles.postTitle }, post)),
                        ),
                      ),
                    ),
                  ),
                );
              },
            },
          ],
        }),
      ),
    ),

    // Footer section
    div(
      { className: styles.footer },
      div(
        { className: styles.container },
        p('Reactive DOM Router Example - Built with reactive primitives and CSS modules'),
      ),
    ),
  );
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Mount the application
  render(app, document.getElementById('app')!);
});
