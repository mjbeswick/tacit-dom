/**
 * @fileoverview Prevent unnecessary computed values
 * @author Tacit-DOM Team
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Prevent unnecessary computed values that don't have reactive dependencies",
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      unnecessaryComputed:
        'This computed value has no reactive dependencies. Consider using a regular variable or function instead.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        // Check if this is a computed() call
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'computed' &&
          node.arguments.length > 0 &&
          (node.arguments[0].type === 'FunctionExpression' ||
            node.arguments[0].type === 'ArrowFunctionExpression')
        ) {
          const computedFunction = node.arguments[0];
          let hasReactiveDependencies = false;

          // Check for reactive dependencies in the computed function
          const checkForReactiveDependencies = (node) => {
            // Check for signal.get() calls
            if (
              node.type === 'CallExpression' &&
              node.callee.type === 'MemberExpression' &&
              node.callee.property.type === 'Identifier' &&
              node.callee.property.name === 'get' &&
              node.callee.object.type === 'Identifier' &&
              (node.callee.object.name.endsWith('Signal') ||
                node.callee.object.name.endsWith('signal') ||
                node.callee.object.name.endsWith('Signal'))
            ) {
              hasReactiveDependencies = true;
              return;
            }

            // Check for other computed() calls (nested computed)
            if (
              node.type === 'CallExpression' &&
              node.callee.type === 'Identifier' &&
              node.callee.name === 'computed'
            ) {
              hasReactiveDependencies = true;
              return;
            }

            // Check for effect() calls
            if (
              node.type === 'CallExpression' &&
              node.callee.type === 'Identifier' &&
              node.callee.name === 'effect'
            ) {
              hasReactiveDependencies = true;
              return;
            }

            // Recursively check child nodes
            if (node.body) {
              if (Array.isArray(node.body)) {
                node.body.forEach(checkForReactiveDependencies);
              } else {
                checkForReactiveDependencies(node.body);
              }
            }
          };

          // Check the function body
          if (computedFunction.body.type === 'BlockStatement') {
            computedFunction.body.body.forEach(checkForReactiveDependencies);
          } else if (computedFunction.body.type === 'Expression') {
            checkForReactiveDependencies(computedFunction.body);
          }

          // Report if no reactive dependencies found
          if (!hasReactiveDependencies) {
            context.report({
              node,
              messageId: 'unnecessaryComputed',
            });
          }
        }
      },
    };
  },
};
