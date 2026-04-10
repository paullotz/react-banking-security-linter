# eslint-plugin-react-banking-security

Domain-aware ESLint plugin for React banking applications that detects security vulnerabilities in banking applications.

## Installation

```bash
npm install --save-dev eslint-plugin-react-banking-security
# or
yarn add --dev eslint-plugin-react-banking-security
# or
pnpm add --save-dev eslint-plugin-react-banking-security
```

## Usage

Add to your ESLint configuration (.eslintrc.json):

```json
{
  "plugins": ["react-banking-security"],
  "rules": {
    "react-banking-security/navigation-security": "error",
    "react-banking-security/data-compliance": "error"
  }
}
```

## Rules

### `navigation-security`
Detects tainted data passed to routing sinks in React banking applications.

### `data-compliance`
Detects sensitive data written to localStorage and other insecure storage.

## License

MIT