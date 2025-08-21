import * as ReactiveDOM from './index';

describe('ReactiveDOM exports', () => {
  describe('signal exports', () => {
    it('should export signal function', () => {
      expect(typeof ReactiveDOM.signal).toBe('function');
      // Test that Signal type is available
      const signal = ReactiveDOM.signal(0);
      expect(signal).toBeDefined();
    });

    it('should export computed function', () => {
      expect(typeof ReactiveDOM.computed).toBe('function');
      // Test that Computation type is available
      const signal = ReactiveDOM.signal(0);
      const computed = ReactiveDOM.computed(() => signal.get() * 2);
      expect(computed).toBeDefined();
    });

    it('should export effect function', () => {
      expect(typeof ReactiveDOM.effect).toBe('function');
    });

    it('should export batch function', () => {
      expect(typeof ReactiveDOM.batch).toBe('function');
    });
  });

  describe('DOM element exports', () => {
    it('should export available HTML elements', () => {
      expect(typeof ReactiveDOM.div).toBe('function');
      expect(typeof ReactiveDOM.h1).toBe('function');
      expect(typeof ReactiveDOM.p).toBe('function');
      expect(typeof ReactiveDOM.span).toBe('function');
      expect(typeof ReactiveDOM.button).toBe('function');
    });

    it('should export utility functions', () => {
      expect(typeof ReactiveDOM.render).toBe('function');
      expect(typeof ReactiveDOM.component).toBe('function');
      expect(typeof ReactiveDOM.useSignal).toBe('function');
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
    it('should export Component type', () => {
      // Test that Component type is available
      const component: ReactiveDOM.Component = () =>
        document.createElement('div');
      expect(typeof component).toBe('function');
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

      const container = document.createElement('div');
      ReactiveDOM.render(button, container);

      expect(container.querySelector('button')).toBeTruthy();
      expect(container.querySelector('button')?.textContent).toBe('Increment');
    });
  });

  describe('default export test', () => {
    it('should have all expected properties', () => {
      const expectedProperties = [
        'signal',
        'computed',
        'effect',
        'batch',
        'component',
        'useSignal',
        'div',
        'button',
        'h1',
        'p',
        'span',
        'render',
        'cleanup',
      ];

      expectedProperties.forEach((prop) => {
        expect(ReactiveDOM).toHaveProperty(prop);
      });
    });
  });
});
