import * as ReactiveDOM from './index';

describe('ReactiveDOM exports', () => {
  describe('signal exports', () => {
    it('should export signal function', () => {
      expect(typeof ReactiveDOM.signal).toBe('function');
    });

    it('should export computed function', () => {
      expect(typeof ReactiveDOM.computed).toBe('function');
    });

    it('should export Signal type', () => {
      // Test that Signal type is available
      const signal = ReactiveDOM.signal(0);
      expect(signal).toBeDefined();
    });

    it('should export Computation type', () => {
      // Test that Computation type is available
      const signal = ReactiveDOM.signal(0);
      const computed = ReactiveDOM.computed(() => signal.get() * 2);
      expect(computed).toBeDefined();
    });
  });

  describe('DOM element exports', () => {
    it('should export common HTML elements', () => {
      expect(typeof ReactiveDOM.div).toBe('function');
      expect(typeof ReactiveDOM.h1).toBe('function');
      expect(typeof ReactiveDOM.h2).toBe('function');
      expect(typeof ReactiveDOM.h3).toBe('function');
      expect(typeof ReactiveDOM.h4).toBe('function');
      expect(typeof ReactiveDOM.h5).toBe('function');
      expect(typeof ReactiveDOM.h6).toBe('function');
      expect(typeof ReactiveDOM.p).toBe('function');
      expect(typeof ReactiveDOM.span).toBe('function');
      expect(typeof ReactiveDOM.a).toBe('function');
      expect(typeof ReactiveDOM.button).toBe('function');
      expect(typeof ReactiveDOM.input).toBe('function');
      expect(typeof ReactiveDOM.textarea).toBe('function');
      expect(typeof ReactiveDOM.select).toBe('function');
      expect(typeof ReactiveDOM.option).toBe('function');
      expect(typeof ReactiveDOM.form).toBe('function');
      expect(typeof ReactiveDOM.label).toBe('function');
      expect(typeof ReactiveDOM.ul).toBe('function');
      expect(typeof ReactiveDOM.ol).toBe('function');
      expect(typeof ReactiveDOM.li).toBe('function');
      expect(typeof ReactiveDOM.table).toBe('function');
      expect(typeof ReactiveDOM.tr).toBe('function');
      expect(typeof ReactiveDOM.td).toBe('function');
      expect(typeof ReactiveDOM.th).toBe('function');
      expect(typeof ReactiveDOM.img).toBe('function');
      expect(typeof ReactiveDOM.video).toBe('function');
      expect(typeof ReactiveDOM.audio).toBe('function');
      expect(typeof ReactiveDOM.canvas).toBe('function');
      expect(typeof ReactiveDOM.nav).toBe('function');
      expect(typeof ReactiveDOM.header).toBe('function');
      expect(typeof ReactiveDOM.footer).toBe('function');
      expect(typeof ReactiveDOM.main).toBe('function');
      expect(typeof ReactiveDOM.section).toBe('function');
      expect(typeof ReactiveDOM.article).toBe('function');
      expect(typeof ReactiveDOM.aside).toBe('function');
      expect(typeof ReactiveDOM.details).toBe('function');
      expect(typeof ReactiveDOM.summary).toBe('function');
      expect(typeof ReactiveDOM.dialog).toBe('function');
      expect(typeof ReactiveDOM.menu).toBe('function');
      expect(typeof ReactiveDOM.menuitem).toBe('function');
      expect(typeof ReactiveDOM.pre).toBe('function');
    });

    it('should export utility functions', () => {
      expect(typeof ReactiveDOM.createElement).toBe('function');
      expect(typeof ReactiveDOM.render).toBe('function');
      expect(typeof ReactiveDOM.cleanup).toBe('function');
    });
  });

  describe('utility exports', () => {
    it('should export ClassValue type', () => {
      // Test that ClassValue type is available
      const testValue: ReactiveDOM.ClassValue = 'test';
      expect(typeof testValue).toBe('string');
    });
  });

  describe('type exports', () => {
    it('should export ElementProps type', () => {
      // Test that ElementProps type is available
      const props: ReactiveDOM.ElementProps = {
        id: 'test',
        className: 'test-class',
      };
      expect(typeof props.id).toBe('string');
      expect(typeof props.className).toBe('string');
    });

    it('should export ElementChildren type', () => {
      // Test that ElementChildren type is available
      const children: ReactiveDOM.ElementChildren = ['text', 42];
      expect(Array.isArray(children)).toBe(true);
    });

    it('should export ElementCreator type', () => {
      // Test that ElementCreator type is available
      const creator: ReactiveDOM.ElementCreator = () =>
        document.createElement('div');
      expect(typeof creator).toBe('function');
    });
  });

  describe('integration test', () => {
    it('should work with all exported functions together', () => {
      // Test that we can use all the main exports together
      const count = ReactiveDOM.signal(0);
      const doubled = ReactiveDOM.computed(() => count.get() * 2);

      const button = ReactiveDOM.button(
        {
          onClick: () => count.set(count.get() + 1),
        },
        'Increment',
      );

      const display = ReactiveDOM.div(
        'Count: ',
        count,
        ' (Doubled: ',
        doubled,
        ')',
      );

      const container = ReactiveDOM.div(
        {
          classNames: ['counter', { active: true }],
        },
        button,
        display,
      );

      expect(count.get()).toBe(0);
      expect(doubled.get()).toBe(0);
      expect(container).toBeDefined();
      expect(button).toBeDefined();
      expect(display).toBeDefined();
    });
  });

  describe('default export test', () => {
    it('should have all expected properties', () => {
      const expectedProperties = [
        // Signal exports
        'signal',
        'computed',
        // DOM element exports
        'div',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'span',
        'a',
        'button',
        'input',
        'textarea',
        'select',
        'option',
        'form',
        'label',
        'ul',
        'ol',
        'li',
        'table',
        'tr',
        'td',
        'th',
        'img',
        'video',
        'audio',
        'canvas',
        'nav',
        'header',
        'footer',
        'main',
        'section',
        'article',
        'aside',
        'details',
        'summary',
        'dialog',
        'menu',
        'menuitem',
        'pre',
        // Utility functions
        'createElement',
        'render',
        'cleanup',
      ];

      expectedProperties.forEach((prop) => {
        expect(ReactiveDOM).toHaveProperty(prop);
      });
    });
  });
});
