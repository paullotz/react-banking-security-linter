import { Rule } from 'eslint';
import { isTainted, clearGraphCache } from '@react-banking-security-linter/core-engine';

const isRoutingSink = (node: any) => {
  if (node.callee.type === 'Identifier' && node.callee.name === 'navigate') {
    return true;
  }
  return false;
};

export const navigationSecurityRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Prevents open redirects via unvalidated routing' },
    messages: { openRedirect: 'Tainted data passed to routing sink.' }
  },
  create(context) {
    const filename = context.filename;
    const sourceCode = context.getSourceCode().getText();

    return {
      Program() {
        clearGraphCache();
      },
      CallExpression(node: any) {
        if (isRoutingSink(node)) {
          const argument = node.arguments[0];
          if (!argument) return;

          if (isTainted(argument, filename, sourceCode)) {
            context.report({
              node,
              messageId: 'openRedirect'
            });
          }
        }
      }
    };
  }
};
