/**
 * @fileoverview Tests for DOM manipulation utilities
 */

// Add missing global polyfills for JSDOM
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

import { JSDOM } from 'jsdom';
import { a, button, cleanup, component, div, h1, render } from './dom';
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

    it('should create div element with className array', () => {
      const element = div({ className: ['class1', 'class2'] });
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('class1 class2');
    });

    it('should create div element with className string', () => {
      const element = div({ className: 'class1 class2' });
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('class1 class2');
    });

    it('should create div element with className object', () => {
      const element = div({ className: { class1: true, class2: false, class3: true } });
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('class1 class3');
    });

    it('should create div element with className mixed array', () => {
      const element = div({ className: ['class1', { class2: true, class3: false }, 'class4'] });
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('class1 class2 class4');
    });

    it('should handle className with falsy values', () => {
      const element = div({ className: ['class1', '', null, undefined, false, 'class2'] });
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('class1 class2');
    });

    it('should filter out falsy children', () => {
      const element = div('Hello', null, undefined, false, '', 'World');
      expect(element.tagName).toBe('DIV');
      expect(element.textContent).toBe('HelloWorld');
    });

    it('should filter out falsy children with props', () => {
      const element = div({ className: 'test' }, 'Hello', null, undefined, false, '', 'World');
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('test');
      expect(element.textContent).toBe('HelloWorld');
    });

    it('should render zero as valid content', () => {
      const element = div('Hello', 0, 'World');
      expect(element.tagName).toBe('DIV');
      expect(element.textContent).toBe('Hello0World');
    });

    it('should handle conditional rendering with falsy values', () => {
      const showExtra = false;
      const element = div('Hello', showExtra && 'Extra', null, undefined, 'World');
      expect(element.textContent).toBe('HelloWorld');
    });

    it('should create div element with string style', () => {
      const element = div({ style: 'background-color: red; color: white;' });
      expect(element.tagName).toBe('DIV');
      expect(element.style.backgroundColor).toBe('red');
      expect(element.style.color).toBe('white');
    });

    it('should create div element with object style', () => {
      const element = div({ style: { backgroundColor: 'red', color: 'white', fontSize: 16 } });
      expect(element.tagName).toBe('DIV');
      expect(element.style.backgroundColor).toBe('red');
      expect(element.style.color).toBe('white');
      expect(element.style.fontSize).toBe('16px');
    });

    it('should create div element with reactive style', () => {
      const colorSignal = signal('red');
      const element = div({ style: { color: colorSignal } });
      expect(element.style.color).toBe('red');

      colorSignal.set('blue');
      expect(element.style.color).toBe('blue');
    });

    it('should create div element with reactive style string', () => {
      const styleSignal = signal('background-color: red; color: white;');
      const element = div({ style: styleSignal });
      expect(element.style.backgroundColor).toBe('red');
      expect(element.style.color).toBe('white');

      styleSignal.set('background-color: blue; color: yellow;');
      expect(element.style.backgroundColor).toBe('blue');
      expect(element.style.color).toBe('yellow');
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

    it('should create button element with onClick handler', () => {
      let clicked = false;
      const element = button({
        onClick: () => {
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
      const element = a({ href: 'https://example.com' }, 'Click here') as HTMLAnchorElement;
      expect(element.tagName).toBe('A');
      expect(element.href).toBe('https://example.com/');
      expect(element.textContent).toBe('Click here');
    });

    it('should create anchor element with target', () => {
      const element = a({ target: '_blank' }, 'Click here') as HTMLAnchorElement;
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
