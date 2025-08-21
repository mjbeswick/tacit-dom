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
    { classNames: styles.app },

    // Header section
    div(
      { classNames: styles.header },
      div(
        { classNames: styles.container },
        div(
          { classNames: styles.headerContent },
          div({ classNames: styles.title }, 'Router Example'),
          p(
            { classNames: styles.subtitle },
            'A simple router with loaders, browser navigation, and reactive state.',
          ),
        ),
      ),
    ),

    // Navigation section
    div(
      { classNames: styles.nav },
      div(
        { classNames: styles.container },
        div(
          { classNames: styles.navContent },
          div(
            { classNames: styles.navLinks },
            div(
              {
                classNames: styles.navBtn,
                onClick: () => navigateTo('/'),
              },
              'Home',
            ),
            div(
              {
                classNames: styles.navBtn,
                onClick: () => navigateTo('/users'),
              },
              'Users',
            ),
            div(
              {
                classNames: styles.navBtn,
                onClick: () => navigateTo('/posts'),
              },
              'Posts',
            ),
          ),
          div(
            { classNames: styles.navButtons },
            button(
              {
                onClick: handleBack,
                classNames: styles.navBtn,
              },
              '← Back',
            ),
            button(
              {
                onClick: handleForward,
                classNames: styles.navBtn,
              },
              'Forward →',
            ),
          ),
        ),
      ),
    ),

    // Main content - flexible and growing
    div(
      { classNames: styles.main },
      div(
        { classNames: styles.container },
        router({
          routes: [
            {
              path: '/',
              component: () => {
                return div(
                  { classNames: styles.page },
                  div(
                    { classNames: styles.card },
                    div(
                      { classNames: styles.cardContent },
                      div(
                        { classNames: styles.cardTitle },
                        'Welcome to the Router Example',
                      ),
                      p(
                        { classNames: styles.pageContent },
                        'This is a simple router built with Reactive DOM. Click the navigation links above to explore different routes.',
                      ),
                      div(
                        { classNames: styles.pageContent },
                        div({ classNames: styles.cardTitle }, 'Features:'),
                        div(
                          { classNames: styles.pageContent },
                          div(
                            { classNames: styles.pageContent },
                            'Route loaders with async data fetching',
                          ),
                          div(
                            { classNames: styles.pageContent },
                            'Browser back/forward navigation',
                          ),
                          div(
                            { classNames: styles.pageContent },
                            'URL parameter parsing',
                          ),
                          div(
                            { classNames: styles.pageContent },
                            'Search parameter handling',
                          ),
                          div(
                            { classNames: styles.pageContent },
                            'Error boundaries',
                          ),
                          div(
                            { classNames: styles.pageContent },
                            'Loading states',
                          ),
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
                  { classNames: styles.page },
                  div(
                    { classNames: styles.card },
                    div(
                      { classNames: styles.cardContent },
                      div({ classNames: styles.cardTitle }, 'Users'),
                      p(
                        { classNames: styles.pageContent },
                        'Here are the users loaded from the server:',
                      ),
                      div(
                        { classNames: styles.userList },
                        ...data.users.map((user: string) =>
                          div(
                            { classNames: styles.userItem },
                            div({ classNames: styles.userName }, user),
                          ),
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
                  { classNames: styles.page },
                  div(
                    { classNames: styles.card },
                    div(
                      { classNames: styles.cardContent },
                      div({ classNames: styles.cardTitle }, 'Posts'),
                      p(
                        { classNames: styles.pageContent },
                        'Here are the posts loaded from the server:',
                      ),
                      div(
                        { classNames: styles.postList },
                        ...data.posts.map((post: string) =>
                          div(
                            { classNames: styles.postItem },
                            div({ classNames: styles.postTitle }, post),
                          ),
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
      { classNames: styles.footer },
      div(
        { classNames: styles.container },
        p(
          'Reactive DOM Router Example - Built with reactive primitives and CSS modules',
        ),
      ),
    ),
  );
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Mount the application
  render(app, document.getElementById('app')!);
});
