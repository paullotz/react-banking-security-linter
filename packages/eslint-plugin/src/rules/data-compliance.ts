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
    docs: {
      description:
        'Detects sensitive data (e.g. authentication tokens, session IDs, PII) being written to localStorage. ' +
        'Storing such data in localStorage is insecure because it is accessible to any JavaScript running on the same origin, ' +
        'making it easy to steal via cross-site scripting (XSS). This is a compliance concern for banking and financial applications.' +
        '\n\nHow to fix:\n' +
        '- For authentication tokens: use HttpOnly, Secure cookies set by the server instead. ' +
        'These cannot be read by JavaScript and are immune to XSS-based token theft.\n' +
        '- For session state that must persist across reloads: consider using an encrypted server-side session store ' +
        'and reference it with a short-lived session cookie.\n' +
        '- For non-critical UI preferences: sessionStorage with a short time-to-live is acceptable, ' +
        'but never store tokens or PII there either.\n' +
        '- Example fix:\n' +
        '  // Before (insecure):\n' +
        '  localStorage.setItem("authToken", token);\n\n' +
        '  // After (secure — server sets cookie):\n' +
        '  // Server responds with Set-Cookie: authToken=<value>; HttpOnly; Secure; SameSite=Strict\n' +
        '  // Client does not handle the token directly.\n'
    },
    messages: {
      insecureStorage:
        'Sensitive data detected in localStorage.setItem() call ({{reason}}, confidence: {{confidence}}). ' +
        'Any script on the page can read localStorage values, so an XSS attack could expose this data. ' +
        'Consider using HttpOnly cookies, sessionStorage with short TTL, or a secure token vault instead.'
    }
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
