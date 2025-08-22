/**
 * @fileoverview ESLint plugin for Tacit-DOM
 * @author Tacit-DOM Team
 */

'use strict';

// Import all rules
const noSideEffectsInComputed = require('./lib/rules/no-side-effects-in-computed');
const properComputedDependencies = require('./lib/rules/proper-computed-dependencies');
const noUnnecessaryComputed = require('./lib/rules/no-unnecessary-computed');
const useComponentSignals = require('./lib/rules/use-component-signals');
const preferValueInSubscribe = require('./lib/rules/prefer-value-in-subscribe');

// Export all rules
module.exports = {
  rules: {
    'no-side-effects-in-computed': noSideEffectsInComputed,
    'proper-computed-dependencies': properComputedDependencies,
    'no-unnecessary-computed': noUnnecessaryComputed,
    'use-component-signals': useComponentSignals,
    'prefer-value-in-subscribe': preferValueInSubscribe,
  },
  configs: {
    recommended: {
      plugins: ['tacit-dom'],
      rules: {
        'tacit-dom/no-side-effects-in-computed': 'error',
        'tacit-dom/proper-computed-dependencies': 'warn',
        'tacit-dom/no-unnecessary-computed': 'warn',
        'tacit-dom/use-component-signals': 'error',
        'tacit-dom/prefer-value-in-subscribe': 'warn',
      },
    },
  },
};
