/**
 * @fileoverview Prefer using .value instead of .get() in subscribe callbacks
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
      description:
        'Prefer using .value instead of .get() in subscribe callbacks to avoid unnecessary dependency tracking',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferValueInSubscribe:
        'Use .value instead of .get() in subscribe callbacks. The .value property provides read-only access without dependency tracking.',
    },
  },

  create(context) {
    return {
      // Check for subscribe() calls
      CallExpression(node) {
        // Check if this is a subscribe() call
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'subscribe' &&
          node.arguments &&
          node.arguments.length > 0 &&
          (node.arguments[0].type === 'FunctionExpression' || node.arguments[0].type === 'ArrowFunctionExpression')
        ) {
          const callback = node.arguments[0];

          // Find all .get() calls within the callback
          const findGetCalls = (node) => {
            if (!node || typeof node !== 'object') return;

            if (
              node.type === 'CallExpression' &&
              node.callee &&
              node.callee.type === 'MemberExpression' &&
              node.callee.property &&
              node.callee.property.type === 'Identifier' &&
              node.callee.property.name === 'get'
            ) {
              // Check if this .get() call is on a signal/computed variable
              if (node.callee.object && node.callee.object.type === 'Identifier') {
                const varName = node.callee.object.name;

                // Look for the variable declaration to see if it's a signal/computed
                const scope = context.getScope();
                const variable = scope.variables.find((v) => v.name === varName);

                if (variable && variable.defs.length > 0) {
                  const def = variable.defs[0];
                  if (def.type === 'Variable' && def.node && def.node.init) {
                    const init = def.node.init;

                    // Check if it's a signal() or computed() call
                    if (
                      init.type === 'CallExpression' &&
                      init.callee &&
                      init.callee.type === 'Identifier' &&
                      (init.callee.name === 'signal' || init.callee.name === 'computed')
                    ) {
                      // This is a .get() call on a signal/computed in a subscribe callback
                      context.report({
                        node,
                        messageId: 'preferValueInSubscribe',
                        fix(fixer) {
                          // Replace .get() with .value
                          return fixer.replaceText(node, `${varName}.value`);
                        },
                      });
                    }
                  }
                }
              }
            }

            // Recursively check child nodes
            if (node.body) {
              if (Array.isArray(node.body)) {
                node.body.forEach(findGetCalls);
              } else {
                findGetCalls(node.body);
              }
            }

            // Check template literal expressions
            if (node.type === 'TemplateLiteral' && node.expressions) {
              node.expressions.forEach(findGetCalls);
            }

            // Check expression statements
            if (node.type === 'ExpressionStatement' && node.expression) {
              findGetCalls(node.expression);
            }

            // Check call expression arguments
            if (node.type === 'CallExpression' && node.arguments) {
              node.arguments.forEach(findGetCalls);
            }
          };

          // Check the callback body for .get() calls
          if (callback.body) {
            if (callback.body.type === 'BlockStatement') {
              callback.body.body.forEach(findGetCalls);
            } else {
              findGetCalls(callback.body);
            }
          }
        }
      },
    };
  },
};
