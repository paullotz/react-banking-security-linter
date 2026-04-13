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
    docs: {
      description:
        'Detects unvalidated user input being passed to navigation calls (e.g. navigate()). ' +
        'This can lead to open-redirect vulnerabilities where an attacker tricks the application into navigating ' +
        'to a malicious URL, potentially facilitating phishing attacks or unauthorized access in banking applications. ' +
        '\n\nHow to fix:\n' +
        '- Validate the input against an allowlist of known safe routes before passing it to navigate().\n' +
        '- Avoid passing raw URL query parameters, path parameters, or hash fragments directly to navigate().\n' +
        '- Use a mapping object (e.g. { "/dashboard": "/dashboard", "/account": "/account" }) to look up ' +
        'the destination instead of using the input directly.\n' +
        '- If dynamic routes are needed, strip any protocol or domain prefix and ensure the path starts with "/".\n' +
        '- Example fix:\n' +
        '  // Before (unsafe):\n' +
        '  navigate(searchParams.get("redirectUrl"));\n\n' +
        '  // After (safe):\n' +
        '  const ALLOWED_ROUTES = ["/dashboard", "/account", "/transactions"];\n' +
        '  const target = searchParams.get("redirectUrl");\n' +
        '  if (ALLOWED_ROUTES.includes(target)) {\n' +
        '    navigate(target);\n' +
        '  }\n'
    },
    messages: {
      openRedirect:
        'Potential open-redirect: user input is passed directly to navigate() without validation. ' +
        'An attacker could manipulate the destination to redirect users to a malicious page. ' +
        'Validate or sanitize the input before navigating, e.g. by checking against an allowlist of known safe routes.'
    }
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
