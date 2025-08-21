/**
 * @fileoverview ESLint plugin for Tacit-DOM
 * @author Tacit-DOM Team
 */

'use strict';

// Import all rules
const noSideEffectsInComputed = require('./lib/rules/no-side-effects-in-computed');
const noSignalCallsInRender = require('./lib/rules/no-signal-calls-in-render');
const properComputedDependencies = require('./lib/rules/proper-computed-dependencies');
const noUnnecessaryComputed = require('./lib/rules/no-unnecessary-computed');

// Export all rules
module.exports = {
  rules: {
    'no-side-effects-in-computed': noSideEffectsInComputed,
    'no-signal-calls-in-render': noSignalCallsInRender,
    'proper-computed-dependencies': properComputedDependencies,
    'no-unnecessary-computed': noUnnecessaryComputed,
  },
  configs: {
    recommended: {
      plugins: ['tacit-dom'],
      rules: {
        'tacit-dom/no-side-effects-in-computed': 'error',
        'tacit-dom/no-signal-calls-in-render': 'warn',
        'tacit-dom/proper-computed-dependencies': 'warn',
        'tacit-dom/no-unnecessary-computed': 'warn',
      },
    },
  },
};
