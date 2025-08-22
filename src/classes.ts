/**
 * @fileoverview Utility for conditionally joining CSS class names together.
 *
 * This module provides a flexible utility function for combining CSS class names
 * with support for conditional classes, arrays, and objects. It's similar to
 * the popular 'clsx' or 'classnames' libraries.
 *
 * @module className
 */

/**
 * Type for class name values.
 *
 * Supports various input types:
 * - string: Direct class names
 * - number: Converted to string
 * - boolean: Skipped (falsy values are ignored)
 * - null/undefined: Skipped
 * - object: Keys are used as class names if values are truthy
 * - array: Recursively processed
 */
type ClassValue = string | number | boolean | null | undefined | { [key: string]: any } | ClassValue[];

/**
 * Conditionally joins CSS class names together.
 *
 * This function takes any number of arguments and joins them into a single
 * space-separated string. It handles various input types intelligently:
 *
 * - Strings and numbers are included as-is
 * - Booleans are skipped (falsy values are ignored)
 * - Arrays are recursively processed
 * - Objects use keys as class names when values are truthy
 *
 * @param inputs - Any number of class name values to join
 * @returns A space-separated string of class names
 *
 * @example
 * ```typescript
 * // Basic usage
 * className('foo', 'bar'); // 'foo bar'
 *
 * // Conditional classes
 * className('foo', { bar: true, baz: false }); // 'foo bar'
 *
 * // Arrays
 * className(['foo', 'bar'], 'baz'); // 'foo bar baz'
 *
 * // Mixed types
 * className('foo', { bar: true }, ['baz', { qux: true }]); // 'foo bar baz qux'
 * ```
 */
function className(...inputs: ClassValue[]): string {
  const result: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      result.push(input);
    } else if (typeof input === 'number') {
      result.push(String(input));
    } else if (typeof input === 'boolean') {
      // Skip boolean values
    } else if (Array.isArray(input)) {
      result.push(className(...input));
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) {
          result.push(key);
        }
      }
    }
  }

  return result.join(' ');
}

export { className };
export type { ClassValue };
