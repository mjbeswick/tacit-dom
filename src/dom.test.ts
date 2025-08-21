/**
 * @fileoverview Tests for DOM manipulation utilities
 */

// Add missing global polyfills for JSDOM
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

import { JSDOM } from 'jsdom';
import {
  a,
  button,
  cleanup,
  component,
  div,
  h1,
  render,
  useSignal,
} from './dom';
import { signal } from './signals';

// Set up JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
});

global.document = dom.window.document;
global.window = dom.window as any;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLButtonElement = dom.window.HTMLButtonElement;
global.HTMLAnchorElement = dom.window.HTMLAnchorElement;
global.HTMLDivElement = dom.window.HTMLDivElement;
global.HTMLHeadingElement = dom.window.HTMLHeadingElement;
global.Event = dom.window.Event;

describe('DOM Element Creation', () => {
  beforeEach(() => {
    // Ensure document.body exists
    if (!document.body) {
      const body = document.createElement('body');
      document.documentElement.appendChild(body);
    }
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Only cleanup if document.body exists
    if (document.body) {
      cleanup(document.body);
    }
  });

  describe('Basic Element Creation', () => {
    it('should create div element with no props', () => {
      const element = div();
      expect(element.tagName).toBe('DIV');
      expect(element.children.length).toBe(0);
    });

    it('should create div element with string children', () => {
      const element = div('Hello', 'World');
      expect(element.tagName).toBe('DIV');
      expect(element.textContent).toBe('HelloWorld');
    });

    it('should create div element with className', () => {
      const element = div({ className: 'test-class' });
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('test-class');
    });

    it('should create div element with classNames array', () => {
      const element = div({ classNames: ['class1', 'class2'] });
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('class1 class2');
    });

    it('should create div element with classNames string', () => {
      const element = div({ classNames: 'class1 class2' });
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('class1 class2');
    });
  });

  describe('Button Element Creation', () => {
    it('should create button element with no props', () => {
      const element = button();
      expect(element.tagName).toBe('BUTTON');
      expect(element.children.length).toBe(0);
    });

    it('should create button element with text content', () => {
      const element = button('Click me');
      expect(element.tagName).toBe('BUTTON');
      expect(element.textContent).toBe('Click me');
    });

    it('should create button element with onclick handler', () => {
      let clicked = false;
      const element = button({
        onclick: () => {
          clicked = true;
        },
      });
      expect(element.tagName).toBe('BUTTON');

      element.click();
      expect(clicked).toBe(true);
    });

    it('should create button element with className', () => {
      const element = button({ className: 'btn btn-primary' });
      expect(element.tagName).toBe('BUTTON');
      expect(element.className).toBe('btn btn-primary');
    });
  });

  describe('Heading Element Creation', () => {
    it('should create h1 element with text content', () => {
      const element = h1('Hello World');
      expect(element.tagName).toBe('H1');
      expect(element.textContent).toBe('Hello World');
    });

    it('should create h1 element with className', () => {
      const element = h1({ className: 'title' }, 'Hello World');
      expect(element.tagName).toBe('H1');
      expect(element.className).toBe('title');
      expect(element.textContent).toBe('Hello World');
    });
  });

  describe('Anchor Element Creation', () => {
    it('should create anchor element with text content', () => {
      const element = a('Click here');
      expect(element.tagName).toBe('A');
      expect(element.textContent).toBe('Click here');
    });

    it('should create anchor element with href', () => {
      const element = a(
        { href: 'https://example.com' },
        'Click here',
      ) as HTMLAnchorElement;
      expect(element.tagName).toBe('A');
      expect(element.href).toBe('https://example.com/');
      expect(element.textContent).toBe('Click here');
    });

    it('should create anchor element with target', () => {
      const element = a(
        { target: '_blank' },
        'Click here',
      ) as HTMLAnchorElement;
      expect(element.tagName).toBe('A');
      expect(element.target).toBe('_blank');
      expect(element.textContent).toBe('Click here');
    });
  });

  describe('Component System', () => {
    it('should create a component that renders', () => {
      const TestComponent = component(() => {
        return div('Hello from component');
      });

      const container = document.createElement('div');
      render(TestComponent, container);

      expect(container.textContent).toContain('Hello from component');
    });

    it('should create a component with props', () => {
      const TestComponent = component((props: { name: string }) => {
        return div(`Hello ${props.name}`);
      });

      const container = document.createElement('div');
      render(TestComponent, container);

      expect(container.textContent).toContain('Hello undefined');
    });

    it('should preserve useSignal values across component re-renders', () => {
      let renderCount = 0;
      const externalSignal = signal(0);

      const TestComponent = component(() => {
        renderCount++;

        // useSignal hook should preserve signal value across re-renders
        const localCounter = useSignal(100);

        return div(
          { className: 'test-component' },
          div({ className: 'local-value' }, `Local: ${localCounter.get()}`),
          div(
            { className: 'external-value' },
            `External: ${externalSignal.get()}`,
          ),
          button(
            {
              className: 'increment-local',
              onclick: () => localCounter.set(localCounter.get() + 1),
            },
            'Increment Local',
          ),
        );
      });

      const container = document.createElement('div');
      render(TestComponent, container);

      // Initial render
      expect(renderCount).toBe(1);
      expect(container.querySelector('.local-value')?.textContent).toBe(
        'Local: 100',
      );
      expect(container.querySelector('.external-value')?.textContent).toBe(
        'External: 0',
      );

      // Click increment button to update local signal
      const incrementButton = container.querySelector(
        '.increment-local',
      ) as HTMLButtonElement;
      incrementButton.click();

      // Wait for effect to run
      return new Promise((resolve) => setTimeout(resolve, 50))
        .then(() => {
          // Local signal should be updated and preserved
          expect(container.querySelector('.local-value')?.textContent).toBe(
            'Local: 101',
          );
          expect(container.querySelector('.external-value')?.textContent).toBe(
            'External: 0',
          );

          // Update external signal to trigger re-render
          externalSignal.set(42);

          return new Promise((resolve) => setTimeout(resolve, 50));
        })
        .then(() => {
          // After re-render, local signal value should still be preserved
          expect(container.querySelector('.local-value')?.textContent).toBe(
            'Local: 101',
          );
          expect(container.querySelector('.external-value')?.textContent).toBe(
            'External: 42',
          );

          // Click increment again to verify local signal still works
          const incrementButton = container.querySelector(
            '.increment-local',
          ) as HTMLButtonElement;
          incrementButton.click();

          return new Promise((resolve) => setTimeout(resolve, 50));
        })
        .then(() => {
          // Local signal should be incremented again
          expect(container.querySelector('.local-value')?.textContent).toBe(
            'Local: 102',
          );
          expect(container.querySelector('.external-value')?.textContent).toBe(
            'External: 42',
          );
        });
    });
  });

  describe('Render Function', () => {
    it('should render component to container', () => {
      const TestComponent = component(() => {
        return div('Test content');
      });

      const container = document.createElement('div');
      render(TestComponent, container);

      expect(container.textContent).toContain('Test content');
    });

    it('should render HTML element to container', () => {
      const element = div('Test content');
      const container = document.createElement('div');
      render(element, container);

      expect(container.textContent).toContain('Test content');
    });
  });

  describe('Cleanup Function', () => {
    it('should remove element from parent', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      parent.appendChild(child);

      expect(parent.children.length).toBe(1);
      cleanup(child);
      expect(parent.children.length).toBe(0);
    });

    it('should handle element without parent gracefully', () => {
      const element = document.createElement('div');
      expect(() => cleanup(element)).not.toThrow();
    });
  });
});
