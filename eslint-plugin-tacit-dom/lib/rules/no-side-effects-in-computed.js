/**
 * @fileoverview Prevent side effects in computed values
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
      description: 'Prevent side effects in computed values',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noSideEffectsInComputed:
        'Computed values should not have side effects. Move side effects outside of computed or use effect() instead.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        // Check if this is a computed() call
        if (
          (node.callee.type === 'Identifier' &&
            node.callee.name === 'computed' &&
            node.arguments.length > 0 &&
            node.arguments[0].type === 'FunctionExpression') ||
          node.arguments[0].type === 'ArrowFunctionExpression'
        ) {
          const computedFunction = node.arguments[0];

          // Check for side effects in the computed function
          const checkForSideEffects = (node) => {
            // Check for signal.set() calls
            if (
              node.type === 'CallExpression' &&
              node.callee.type === 'MemberExpression' &&
              node.callee.property.type === 'Identifier' &&
              node.callee.property.name === 'set' &&
              node.callee.object.type === 'Identifier' &&
              (node.callee.object.name.endsWith('Signal') ||
                node.callee.object.name.endsWith('signal') ||
                node.callee.object.name.endsWith('Signal'))
            ) {
              context.report({
                node,
                messageId: 'noSideEffectsInComputed',
              });
            }

            // Check for signal.update() calls
            if (
              node.type === 'CallExpression' &&
              node.callee.type === 'MemberExpression' &&
              node.callee.property.type === 'Identifier' &&
              node.callee.property.name === 'update' &&
              node.callee.object.type === 'Identifier' &&
              (node.callee.object.name.endsWith('Signal') ||
                node.callee.object.name.endsWith('signal') ||
                node.callee.object.name.endsWith('Signal'))
            ) {
              context.report({
                node,
                messageId: 'noSideEffectsInComputed',
              });
            }

            // Check for other potential side effects
            if (
              node.type === 'AssignmentExpression' ||
              node.type === 'UpdateExpression' ||
              (node.type === 'CallExpression' &&
                node.callee.type === 'Identifier' &&
                ['console.log', 'console.warn', 'console.error'].includes(
                  node.callee.name,
                ))
            ) {
              context.report({
                node,
                messageId: 'noSideEffectsInComputed',
              });
            }

            // Recursively check child nodes
            if (node.body) {
              if (Array.isArray(node.body)) {
                node.body.forEach(checkForSideEffects);
              } else {
                checkForSideEffects(node.body);
              }
            }
          };

          // Check the function body
          if (computedFunction.body.type === 'BlockStatement') {
            computedFunction.body.body.forEach(checkForSideEffects);
          } else if (computedFunction.body.type === 'Expression') {
            checkForSideEffects(computedFunction.body);
          }
        }
      },
    };
  },
};
