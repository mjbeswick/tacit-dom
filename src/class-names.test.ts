import { classNames, type ClassValue } from './class-names';

describe('classNames', () => {
  describe('basic functionality', () => {
    it('should join multiple strings with spaces', () => {
      expect(classNames('foo', 'bar', 'baz')).toBe('foo bar baz');
    });

    it('should handle single string input', () => {
      expect(classNames('foo')).toBe('foo');
    });

    it('should handle empty string input', () => {
      expect(classNames('')).toBe('');
    });

    it('should handle no arguments', () => {
      expect(classNames()).toBe('');
    });
  });

  describe('number inputs', () => {
    it('should convert numbers to strings', () => {
      expect(classNames(1, 2, 3)).toBe('1 2 3');
    });

    it('should handle zero', () => {
      expect(classNames(0)).toBe('');
    });

    it('should handle negative numbers', () => {
      expect(classNames(-1, -2)).toBe('-1 -2');
    });
  });

  describe('boolean inputs', () => {
    it('should ignore boolean values', () => {
      expect(classNames(true, false, 'foo')).toBe('foo');
    });

    it('should handle only boolean values', () => {
      expect(classNames(true, false)).toBe('');
    });
  });

  describe('null and undefined', () => {
    it('should ignore null and undefined values', () => {
      expect(classNames(null, undefined, 'foo')).toBe('foo');
    });

    it('should handle only null and undefined', () => {
      expect(classNames(null, undefined)).toBe('');
    });
  });

  describe('object inputs', () => {
    it('should include keys with truthy values', () => {
      expect(classNames({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });

    it('should handle empty object', () => {
      expect(classNames({})).toBe('');
    });

    it('should handle object with all falsy values', () => {
      expect(classNames({ foo: false, bar: null, baz: undefined })).toBe('');
    });

    it('should handle object with all truthy values', () => {
      expect(classNames({ foo: true, bar: 'truthy', baz: 1 })).toBe(
        'foo bar baz',
      );
    });
  });

  describe('array inputs', () => {
    it('should process arrays recursively', () => {
      expect(classNames(['foo', 'bar'], 'baz')).toBe('foo bar baz');
    });

    it('should handle nested arrays', () => {
      expect(classNames(['foo', ['bar', 'baz']], 'qux')).toBe(
        'foo bar baz qux',
      );
    });

    it('should handle empty arrays', () => {
      expect(classNames([], 'foo')).toBe(' foo');
    });

    it('should handle arrays with mixed types', () => {
      expect(classNames(['foo', { bar: true, baz: false }, 'qux'])).toBe(
        'foo bar qux',
      );
    });
  });

  describe('mixed inputs', () => {
    it('should handle complex mixed inputs', () => {
      expect(
        classNames(
          'foo',
          { bar: true, baz: false },
          ['qux', { quux: true }],
          'corge',
        ),
      ).toBe('foo bar qux quux corge');
    });

    it('should handle mixed inputs with falsy values', () => {
      expect(
        classNames(
          'foo',
          null,
          { bar: true, baz: false },
          undefined,
          ['qux', false, 'quux'],
          true,
        ),
      ).toBe('foo bar qux quux');
    });
  });

  describe('edge cases', () => {
    it('should handle deeply nested arrays', () => {
      expect(classNames(['foo', ['bar', ['baz', 'qux']]])).toBe(
        'foo bar baz qux',
      );
    });

    it('should handle objects with nested structures', () => {
      expect(classNames({ foo: true }, ['bar', { baz: true }])).toBe(
        'foo bar baz',
      );
    });

    it('should handle all falsy inputs', () => {
      expect(classNames(null, undefined, false, 0, '')).toBe('');
    });
  });

  describe('TypeScript types', () => {
    it('should have correct ClassValue type', () => {
      // This test ensures the type is exported correctly
      const testValue: ClassValue = 'test';
      expect(typeof testValue).toBe('string');
    });
  });
});
