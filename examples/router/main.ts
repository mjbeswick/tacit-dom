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
  div,
  button,
  h1,
  h2,
  h3,
  p,
  nav,
  header,
  footer,
  main,
  link,
  router,
  history,
  ul,
  li,
} from 'reactive-dom';

const app = () => {
  const handleBack = () => {
    history.back();
  };

  const handleForward = () => {
    history.forward();
  };

  return div(
    header(
      h1('Router Example'),
      p(
        'A simple router with loaders, browser navigation, and reactive state.',
      ),
    ),
    nav(
      div(
        { className: 'nav-links' },
        link({
          to: '/',
          children: 'Home',
          className: 'button',
        }),
        link({
          to: '/users',
          children: 'Users',
          className: 'button',
        }),
        link({
          to: '/posts',
          children: 'Posts',
          className: 'button',
        }),
      ),
      div(
        { className: 'browser-nav' },
        button(
          {
            onclick: handleBack,
            className: 'button',
          },
          '← Back',
        ),
        button(
          {
            onclick: handleForward,
            className: 'button',
          },
          'Forward →',
        ),
      ),
    ),
    main(
      router({
        routes: [
          {
            path: '/',
            component: () => {
              return div(
                { className: 'content' },
                h2('Welcome to the Router Example'),
                p(
                  'This is a simple router built with Reactive DOM. Click the navigation links above to explore different routes.',
                ),
                div(
                  { className: 'feature-list' },
                  h3('Features:'),
                  ul(
                    li('Route loaders with async data fetching'),
                    li('Browser back/forward navigation'),
                    li('URL parameter parsing'),
                    li('Search parameter handling'),
                    li('Error boundaries'),
                    li('Loading states'),
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
            component: (data) => {
              console.log('Rendering users', data);
              return div(
                { className: 'content' },
                h2('Users'),
                p('Here are the users loaded from the server:'),
                div(
                  { className: 'user-list' },
                  ...data.users.map((user: string) =>
                    div({ className: 'user-item' }, h3(user)),
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
            component: (data) => {
              console.log('Rendering posts', data);
              return div(
                { className: 'content' },
                h2('Posts'),
                p('Here are the posts loaded from the server:'),
                div(
                  { className: 'post-list' },
                  ...data.posts.map((post: string) =>
                    div({ className: 'post-item' }, h3(post)),
                  ),
                ),
              );
            },
          },
        ],
      }),
    ),
    footer(
      p(
        'Reactive DOM Router Example - Built with reactive primitives and SimpleCSS',
      ),
    ),
  );
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.appendChild(app());
  }
});
