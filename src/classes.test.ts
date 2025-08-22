import { className } from './classes';

describe('className', () => {
  it('should return empty string for no inputs', () => {
    expect(className()).toBe('');
  });

  it('should filter out falsy values', () => {
    expect(className('', null, undefined, false, 0)).toBe('');
  });

  it('should join multiple strings with spaces', () => {
    expect(className('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('should handle single string input', () => {
    expect(className('single')).toBe('single');
  });

  describe('string handling', () => {
    it('should join multiple strings', () => {
      expect(className('hello', 'world')).toBe('hello world');
    });

    it('should filter out empty strings', () => {
      expect(className('hello', '', 'world')).toBe('hello world');
    });

    it('should preserve spaces within strings', () => {
      expect(className('hello world', 'test')).toBe('hello world test');
    });

    it('should handle CSS-like class names', () => {
      expect(className('btn-primary', 'btn--large')).toBe('btn-primary btn--large');
    });
  });

  describe('number handling', () => {
    it('should convert numbers to strings', () => {
      expect(className('foo', 42, 'bar')).toBe('foo 42 bar');
    });

    it('should filter out zero', () => {
      expect(className('foo', 0, 'bar')).toBe('foo bar');
    });

    it('should handle negative numbers', () => {
      expect(className('foo', -1, 'bar')).toBe('foo -1 bar');
    });

    it('should handle decimal numbers', () => {
      expect(className('foo', 3.14, 'bar')).toBe('foo 3.14 bar');
    });
  });

  describe('boolean handling', () => {
    it('should filter out boolean values', () => {
      expect(className('foo', true, 'bar')).toBe('foo bar');
    });

    it('should filter out false values', () => {
      expect(className('foo', false, 'bar')).toBe('foo bar');
    });

    it('should filter out both true and false', () => {
      expect(className('foo', true, false, 'bar')).toBe('foo bar');
    });
  });

  describe('null/undefined handling', () => {
    it('should filter out null values', () => {
      expect(className('foo', null, 'bar')).toBe('foo bar');
    });

    it('should filter out undefined values', () => {
      expect(className('foo', undefined, 'bar')).toBe('foo bar');
    });

    it('should filter out both null and undefined', () => {
      expect(className('foo', null, undefined, 'bar')).toBe('foo bar');
    });
  });

  describe('object handling', () => {
    it('should use keys with truthy values', () => {
      expect(className('foo', { bar: true, baz: false, qux: 1 })).toBe('foo bar qux');
    });

    it('should filter out keys with falsy values', () => {
      expect(className('foo', { bar: false, baz: 0, qux: null, quux: undefined })).toBe('foo');
    });

    it('should handle empty objects', () => {
      expect(className('foo', {}, 'bar')).toBe('foo bar');
    });

    it('should handle string values in objects', () => {
      expect(className('foo', { bar: 'truthy', baz: '' })).toBe('foo bar');
    });

    it('should handle function values in objects', () => {
      expect(className('foo', { bar: () => true, baz: () => false })).toBe('foo bar baz');
    });

    it('should handle array values in objects', () => {
      expect(className('foo', { bar: [1, 2, 3], baz: [] })).toBe('foo bar baz');
    });
  });

  describe('array handling', () => {
    it('should flatten arrays', () => {
      expect(className('foo', ['bar', 'baz'])).toBe('foo bar baz');
    });

    it('should handle nested objects in arrays', () => {
      expect(className('foo', ['bar', { baz: true, qux: false }, 'quux'])).toBe('foo bar baz quux');
    });

    it('should handle deeply nested arrays', () => {
      expect(className('foo', ['bar', ['baz', ['qux']]])).toBe('foo bar baz qux');
    });

    it('should filter falsy values in arrays', () => {
      expect(className('foo', ['bar', '', null, undefined, false, 'baz'])).toBe('foo bar baz');
    });

    it('should handle empty arrays', () => {
      expect(className('foo', [], 'bar')).toBe('foo  bar');
    });

    it('should handle objects in arrays', () => {
      expect(className('foo', [{ bar: true, baz: false }])).toBe('foo bar');
    });
  });

  describe('complex combinations', () => {
    it('should handle mixed types', () => {
      const result = className(
        'base',
        'static',
        { conditional: true, hidden: false },
        ['array', 'items'],
        null,
        undefined,
        false,
        0,
        '',
        'final',
      );
      expect(result).toBe('base static conditional array items final');
    });

    it('should handle deeply nested structures', () => {
      className('root', ['level1', ['level2', { level3: true, level3b: false }], { level1b: true }], 'sibling');
    });

    it('should handle multiple arrays', () => {
      expect(className(['foo', 'bar'], ['baz', 'qux'], 'extra')).toBe('foo bar baz qux extra');
    });
  });

  describe('edge cases', () => {
    it('should handle all falsy values', () => {
      expect(className('', null, undefined, false, 0, NaN)).toBe('');
    });

    it('should handle object inheritance', () => {
      const obj = Object.create({ inherited: true });
      obj.own = true;
      expect(className('foo', obj)).toBe('foo own inherited');
    });

    it('should handle object with toString method', () => {
      const obj = { toString: () => 'normal' };
      expect(className('foo', obj)).toBe('foo toString');
    });

    it('should handle very long class names', () => {
      const longClass = 'a'.repeat(1000);
      expect(className(longClass)).toBe(longClass);
    });

    it('should handle spread operator', () => {
      const args = ['foo', 'bar', 'baz'];
      const result = className(...args);
      expect(result).toBe('foo bar baz');
    });
  });

  describe('performance', () => {
    it('should handle large numbers of inputs efficiently', () => {
      const largeNested = Array(100)
        .fill(0)
        .map((_, i) => `class-${i}`);
      const result = className('base', ...largeNested);
      expect(result).toContain('base');
      expect(result).toContain('class-99');
    });
  });
});
