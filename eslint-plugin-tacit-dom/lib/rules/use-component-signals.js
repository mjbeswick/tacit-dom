/**
 * @fileoverview Enforce use of component-scoped signals in components
 * @author Tacit-DOM Team
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce use of component-scoped signals (utils.signal) instead of global signals in components',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      useComponentSignals:
        'Use utils.signal() instead of signal() in components. Local signals should be component-scoped.',
    },
  },

  create(context) {
    let isInComponent = false;
    let hasUtilsParameter = false;

    return {
      // Track component entry/exit and signal usage
      CallExpression(node) {
        // Check if this is a component() call
        if (node.callee.type === 'Identifier' && node.callee.name === 'component') {
          isInComponent = true;

          // Check if the component function has a utils parameter
          if (
            node.arguments.length > 0 &&
            node.arguments[0].type === 'ArrowFunctionExpression' &&
            node.arguments[0].params.length > 1
          ) {
            hasUtilsParameter = true;
          } else if (
            node.arguments.length > 0 &&
            node.arguments[0].type === 'FunctionExpression' &&
            node.arguments[0].params.length > 1
          ) {
            hasUtilsParameter = true;
          }
        }

        // Check for global signal() usage in components
        if (isInComponent && hasUtilsParameter && node.callee.type === 'Identifier' && node.callee.name === 'signal') {
          context.report({
            node,
            messageId: 'useComponentSignals',
          });
        }
      },

      // Track when we exit a component function
      'CallExpression:exit'(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'component') {
          isInComponent = false;
          hasUtilsParameter = false;
        }
      },
    };
  },
};
