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
} from 'thorix';

const app = () => {
  const handleBack = () => {
    history.back();
  };

  const handleForward = () => {
    history.forward();
  };

  return div(
    { className: 'min-vh-100 d-flex flex-column' },

    // Header section
    header(
      { className: 'bg-primary text-white py-5 flex-shrink-0' },
      div(
        { className: 'container' },
        div(
          { className: 'row justify-content-center' },
          div(
            { className: 'col-lg-8 text-center' },
            h1({ className: 'display-4 mb-3' }, 'Router Example'),
            p(
              { className: 'lead mb-0' },
              'A simple router with loaders, browser navigation, and reactive state.',
            ),
          ),
        ),
      ),
    ),

    // Navigation section
    nav(
      { className: 'bg-light py-3 flex-shrink-0' },
      div(
        { className: 'container' },
        div(
          { className: 'row align-items-center' },
          div(
            { className: 'col-lg-8 col-md-7 mb-3 mb-md-0' },
            div(
              {
                className:
                  'd-flex gap-2 flex-wrap justify-content-center justify-content-md-start',
              },
              link({
                to: '/',
                children: 'Home',
                className: 'btn btn-outline-primary',
              }),
              link({
                to: '/users',
                children: 'Users',
                className: 'btn btn-outline-primary',
              }),
              link({
                to: '/posts',
                children: 'Posts',
                className: 'btn btn-outline-primary',
              }),
            ),
          ),
          div(
            { className: 'col-lg-4 col-md-5' },
            div(
              {
                className:
                  'd-flex gap-2 justify-content-center justify-content-md-end',
              },
              button(
                {
                  onclick: handleBack,
                  className: 'btn btn-secondary',
                },
                '← Back',
              ),
              button(
                {
                  onclick: handleForward,
                  className: 'btn btn-secondary',
                },
                'Forward →',
              ),
            ),
          ),
        ),
      ),
    ),

    // Main content - flexible and growing
    main(
      { className: 'flex-grow-1 py-4' },
      div(
        { className: 'container' },
        router({
          routes: [
            {
              path: '/',
              component: () => {
                return div(
                  { className: 'row justify-content-center' },
                  div(
                    { className: 'col-lg-8' },
                    div(
                      { className: 'card shadow-sm' },
                      div(
                        { className: 'card-body text-center' },
                        h2(
                          { className: 'card-title h3 mb-4' },
                          'Welcome to the Router Example',
                        ),
                        p(
                          { className: 'card-text mb-4' },
                          'This is a simple router built with Reactive DOM. Click the navigation links above to explore different routes.',
                        ),
                        div(
                          { className: 'text-start' },
                          h3({ className: 'h5 mb-3' }, 'Features:'),
                          ul(
                            { className: 'list-unstyled' },
                            li(
                              { className: 'mb-2' },
                              'Route loaders with async data fetching',
                            ),
                            li(
                              { className: 'mb-2' },
                              'Browser back/forward navigation',
                            ),
                            li({ className: 'mb-2' }, 'URL parameter parsing'),
                            li(
                              { className: 'mb-2' },
                              'Search parameter handling',
                            ),
                            li({ className: 'mb-2' }, 'Error boundaries'),
                            li({ className: 'mb-0' }, 'Loading states'),
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
              component: (data) => {
                console.log('Rendering users', data);
                return div(
                  { className: 'row justify-content-center' },
                  div(
                    { className: 'col-lg-8' },
                    div(
                      { className: 'card shadow-sm' },
                      div(
                        { className: 'card-body' },
                        h2({ className: 'card-title h3 mb-4' }, 'Users'),
                        p(
                          { className: 'card-text mb-4' },
                          'Here are the users loaded from the server:',
                        ),
                        div(
                          { className: 'row g-3' },
                          ...data.users.map((user: string) =>
                            div(
                              { className: 'col-md-4' },
                              div(
                                {
                                  className: 'p-3 bg-light rounded text-center',
                                },
                                h3({ className: 'h5 mb-0' }, user),
                              ),
                            ),
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
              component: (data) => {
                console.log('Rendering posts', data);
                return div(
                  { className: 'row justify-content-center' },
                  div(
                    { className: 'col-lg-8' },
                    div(
                      { className: 'card shadow-sm' },
                      div(
                        { className: 'card-body' },
                        h2({ className: 'card-title h3 mb-4' }, 'Posts'),
                        p(
                          { className: 'card-text mb-4' },
                          'Here are the posts loaded from the server:',
                        ),
                        div(
                          { className: 'row g-3' },
                          ...data.posts.map((post: string) =>
                            div(
                              { className: 'col-md-4' },
                              div(
                                {
                                  className: 'p-3 bg-light rounded text-center',
                                },
                                h3({ className: 'h5 mb-0' }, post),
                              ),
                            ),
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
    footer(
      { className: 'bg-light py-3 flex-shrink-0' },
      div(
        { className: 'container' },
        div(
          { className: 'row justify-content-center' },
          div(
            { className: 'col-12 text-center' },
            p(
              { className: 'text-muted mb-0' },
              'Reactive DOM Router Example - Built with reactive primitives and Bootstrap',
            ),
          ),
        ),
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
