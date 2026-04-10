# React-Banking-Security-Linter

A domain-aware ESLint plugin for detecting security vulnerabilities in React banking applications using Component Oriented Graph (COG) analysis.

## Overview

The React-Banking-Security-Linter is a static analysis tool that detects security vulnerabilities in React applications by reconstructing a Component Graph (CG) to trace tainted data across component boundaries. The artifact implements two primary security rules:

- **Navigation Security**: Detects open redirect vulnerabilities by tracing tainted data from URL parameters to navigation functions
- **Data Compliance**: Identifies insecure storage of sensitive data (tokens, session IDs) in localStorage

The plugin integrates directly into the developer's IDE, providing real-time feedback with sub-100ms latency per file.

## Installation

Since this is a research artifact and not published to npm, users must clone the repository and build it locally:

```bash
git clone https://github.com/username/react-banking-security-linter.git
cd react-banking-security-linter
pnpm install
pnpm build
```

## Configuration

Add the plugin to your `.eslintrc.json`:

```json
{
  "plugins": ["react-banking-security"],
  "rules": {
    "react-banking-security/navigation-security": "error",
    "react-banking-security/data-compliance": "error"
  }
}
```

## Usage

The plugin automatically analyzes React components during development. Security violations appear as standard ESLint errors in your IDE.

## Study Instructions

For researchers conducting the usability study, please refer to the complete study materials in the `study-materials/` directory. The README in that directory contains the full protocol, including:

- Participant instructions
- Pre-study and post-study questionnaires
- Task procedure for both control and treatment phases
- Vulnerability key (researcher only)
- Metrics to record

The study follows a within-subjects design where participants complete two 15-minute analysis tasks: Phase 1 without the linter enabled, and Phase 2 with the linter active. All materials are self-contained in the `study-materials/` directory.

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run ESLint on test components
npx eslint packages/test-cases/test-components/PositiveControls.tsx
```