import { classes, type ClassValue } from './classes';

describe('classes', () => {
  describe('basic functionality', () => {
    it('should return empty string for no arguments', () => {
      expect(classes()).toBe('');
    });

    it('should return empty string for falsy arguments', () => {
      expect(classes('', null, undefined, false, 0)).toBe('');
    });

    it('should join multiple string arguments with spaces', () => {
      expect(classes('foo', 'bar', 'baz')).toBe('foo bar baz');
    });

    it('should handle single string argument', () => {
      expect(classes('single')).toBe('single');
    });
  });

  describe('string inputs', () => {
    it('should include non-empty strings', () => {
      expect(classes('hello', 'world')).toBe('hello world');
    });

    it('should skip empty strings', () => {
      expect(classes('hello', '', 'world')).toBe('hello world');
    });

    it('should handle strings with spaces', () => {
      expect(classes('hello world', 'test')).toBe('hello world test');
    });

    it('should handle special characters', () => {
      expect(classes('btn-primary', 'btn--large')).toBe(
        'btn-primary btn--large',
      );
    });
  });

  describe('number inputs', () => {
    it('should convert positive numbers to strings', () => {
      expect(classes('foo', 42, 'bar')).toBe('foo 42 bar');
    });

    it('should skip zero (falsy)', () => {
      expect(classes('foo', 0, 'bar')).toBe('foo bar');
    });

    it('should convert negative numbers to strings', () => {
      expect(classes('foo', -1, 'bar')).toBe('foo -1 bar');
    });

    it('should handle decimal numbers', () => {
      expect(classes('foo', 3.14, 'bar')).toBe('foo 3.14 bar');
    });
  });

  describe('boolean inputs', () => {
    it('should skip true values', () => {
      expect(classes('foo', true, 'bar')).toBe('foo bar');
    });

    it('should skip false values', () => {
      expect(classes('foo', false, 'bar')).toBe('foo bar');
    });

    it('should handle mixed boolean values', () => {
      expect(classes('foo', true, false, 'bar')).toBe('foo bar');
    });
  });

  describe('null and undefined inputs', () => {
    it('should skip null values', () => {
      expect(classes('foo', null, 'bar')).toBe('foo bar');
    });

    it('should skip undefined values', () => {
      expect(classes('foo', undefined, 'bar')).toBe('foo bar');
    });

    it('should handle mixed null/undefined values', () => {
      expect(classes('foo', null, undefined, 'bar')).toBe('foo bar');
    });
  });

  describe('object inputs', () => {
    it('should include keys with truthy values', () => {
      expect(classes('foo', { bar: true, baz: false, qux: 1 })).toBe(
        'foo bar qux',
      );
    });

    it('should skip keys with falsy values', () => {
      expect(
        classes('foo', { bar: false, baz: 0, qux: null, quux: undefined }),
      ).toBe('foo');
    });

    it('should handle empty objects', () => {
      expect(classes('foo', {}, 'bar')).toBe('foo bar');
    });

    it('should handle objects with string values', () => {
      expect(classes('foo', { bar: 'truthy', baz: '' })).toBe('foo bar');
    });

    it('should handle objects with function values', () => {
      expect(classes('foo', { bar: () => true, baz: () => false })).toBe(
        'foo bar baz',
      );
    });

    it('should handle objects with array values', () => {
      expect(classes('foo', { bar: [1, 2, 3], baz: [] })).toBe('foo bar baz');
    });
  });

  describe('array inputs', () => {
    it('should process nested arrays recursively', () => {
      expect(classes('foo', ['bar', 'baz'])).toBe('foo bar baz');
    });

    it('should handle nested arrays with mixed types', () => {
      expect(classes('foo', ['bar', { baz: true, qux: false }, 'quux'])).toBe(
        'foo bar baz quux',
      );
    });

    it('should handle deeply nested arrays', () => {
      expect(classes('foo', ['bar', ['baz', ['qux']]])).toBe('foo bar baz qux');
    });

    it('should handle arrays with falsy values', () => {
      expect(classes('foo', ['bar', '', null, undefined, false, 'baz'])).toBe(
        'foo bar baz',
      );
    });

    it('should handle empty arrays', () => {
      expect(classes('foo', [], 'bar')).toBe('foo  bar');
    });

    it('should handle arrays with objects', () => {
      expect(classes('foo', [{ bar: true, baz: false }])).toBe('foo bar');
    });
  });

  describe('mixed input types', () => {
    it('should handle complex mixed inputs', () => {
      const result = classes(
        'base-class',
        { 'conditional-class': true, hidden: false },
        ['nested', { deep: true }],
        42,
        null,
        undefined,
        false,
        'final-class',
      );
      expect(result).toBe(
        'base-class conditional-class nested deep 42 final-class',
      );
    });

    it('should handle multiple objects', () => {
      expect(
        classes(
          { btn: true, 'btn-primary': true },
          { 'btn-large': false, 'btn-disabled': true },
        ),
      ).toBe('btn btn-primary btn-disabled');
    });

    it('should handle multiple arrays', () => {
      expect(classes(['foo', 'bar'], ['baz', 'qux'], 'extra')).toBe(
        'foo bar baz qux extra',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle all falsy values', () => {
      expect(classes('', null, undefined, false, 0, NaN)).toBe('');
    });

    it('should handle objects with inherited properties', () => {
      const obj = Object.create({ inherited: true });
      obj.own = true;
      expect(classes('foo', obj)).toBe('foo own inherited');
    });

    it('should handle objects with symbol keys', () => {
      const sym = Symbol('test');
      const obj = { [sym]: true, normal: true };
      expect(classes('foo', obj)).toBe('foo normal');
    });

    it('should handle very long class names', () => {
      const longClass = 'a'.repeat(1000);
      expect(classes(longClass)).toBe(longClass);
    });

    it('should handle many arguments', () => {
      const args = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = classes(...args);
      expect(result.split(' ')).toHaveLength(100);
      expect(result).toContain('class-0');
      expect(result).toContain('class-99');
    });
  });

  describe('type exports', () => {
    it('should export ClassValue type', () => {
      // This test ensures the type is exported and can be used
      const testValue: ClassValue = 'test';
      expect(typeof testValue).toBe('string');
    });

    it('should export classes function', () => {
      expect(typeof classes).toBe('function');
    });
  });

  describe('performance characteristics', () => {
    it('should handle large nested structures efficiently', () => {
      const largeNested = Array.from({ length: 100 }, (_, i) =>
        Array.from({ length: 10 }, (_, j) => `class-${i}-${j}`),
      );

      const start = performance.now();
      const result = classes('base', ...largeNested);
      const end = performance.now();

      expect(result).toContain('base');
      expect(result).toContain('class-0-0');
      expect(result).toContain('class-99-9');
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});
