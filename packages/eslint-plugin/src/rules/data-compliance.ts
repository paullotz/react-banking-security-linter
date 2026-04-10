import { Rule } from 'eslint';
import { hasSensitiveNomenclature, analyzeSensitiveContext } from '@react-banking-security-linter/core-engine';

const isLocalStorageSetItem = (node: any) => {
  if (
    node.callee.type === 'MemberExpression' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'setItem'
  ) {
    return true;
  }
  return false;
};

export const dataComplianceRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Blocks insecure storage of sensitive tokens.' },
    messages: { insecureStorage: 'Sensitive data written to localStorage.' }
  },
  create(context) {
    const sourceCode = context.sourceCode.getText();

    return {
      CallExpression(node: any) {
        if (isLocalStorageSetItem(node)) {
          const payloadNode = node.arguments[1];
          if (!payloadNode) return;

          if (hasSensitiveNomenclature(payloadNode, sourceCode)) {
            const analysis = analyzeSensitiveContext(payloadNode, sourceCode);

            if (analysis.isSensitive) {
              context.report({
                node,
                messageId: 'insecureStorage',
                data: {
                  reason: analysis.reason,
                  confidence: analysis.confidence
                }
              });
            }
          }
        }
      }
    };
  }
};
