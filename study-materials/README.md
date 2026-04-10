# Usability Study Materials

 This directory contains the materials for the developer usability study described in Section 4.5 of the thesis.

## Structure

```
study-materials/
├── README.md                  # This file
├── banking-app-control/       # Phase 1: Without plugin (standard ESLint only)
 **Banking-app-treatment/  # Phase 2: With plugin (React-Banking-Security-Linter enabled)
```

## Vulnerability Key (RESEARCHER ONLY)

 The application contains 3 hidden security vulnerabilities across 2 pages. Participants in Phase 1 search manually without the plugin. In Phase 2 they use the plugin for find them immediately.

.

 ### Vulnerability 1: Open Redirect (ASVS 5.1.5) — LoginPage.tsx

 | Detail | Value |
|--------|-------|
| Source | `searchParams.get('callback')` → stored as `callbackUrl` |
| Propagation | `callbackUrl` → `setDestination(callbackUrl)` via useEffect |
| Sink | `navigate(destination)` in handleLogin | |
| Lines | useEffect (~line 19), handleLogin (~line 44) |
| ### Vulnerability 2: Insecure Token Storage (ASVS 14.3.3) — SecurityPage.tsx
 | Detail | Value |
|--------|-------|
| Function | `refreshAuthentication` |
| API | `fetch('/api/auth/session')` |
| Stored | `localStorage.setItem('accessToken', payload.accessToken)` + `localStorage.setItem('sessionRef', payload.sessionId)` |
| Detected by | Nomenclature: `accessToken`, and `sessionRef` |
| ### Vulnerability 3: Insecure Token Storage (ASVS 14.3.3) — SecurityPage.tsx
 | Detail | Value |
|--------|-------|
| Function | `recoverCredentials` |
| API | `fetch('/api/credentials')` |
| Stored | `localStorage.setItem('credentialToken', result.credentialToken)` |
| Detected by | Nomenclature: `credentialToken` |
| ## Session Setup |
| ### Phase 1: Without Plugin (15 minutes)
1. Open `banking-app-control/` in VS Code with only standard ESLint active
2. Ensure React-Banking-Security-Linter is NOT configured
3. Give participant 15 minutes |
| ### Phase 2: With Plugin (15 minutes)
1. Enable React-Banking-Security-Linter in the ESLint config
2. Run `pnpm build` from the monorepo root first
3. Give participant 15 minutes on the same codebase |
| ## Metrics to Record
 For each phase:
- Time to first vulnerability found
- Number of vulnerabilities found at 5, 10, and 15 minutes
- Which specific vulnerabilities were identified
- Notable participant comments or strategies
