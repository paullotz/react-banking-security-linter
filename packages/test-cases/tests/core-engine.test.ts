import { describe, it, expect } from 'vitest';
import {
  buildComponentGraph,
  isTainted,
  hasSensitiveNomenclature,
  analyzeSensitiveContext
} from '@react-banking-security-linter/core-engine';

describe('Component Graph Builder', () => {
  it('should build a graph with components', () => {
    const code = `
      import React from 'react';
      export const TestComponent = () => {
        return <div>Test</div>;
      };
    `;

    const graph = buildComponentGraph(code, 'test.tsx');
    expect(graph.components.size).toBeGreaterThan(0);
  });

  it('should identify React hooks', () => {
    const code = `
      import React from 'react';
      export const TestComponent = () => {
        const [state, setState] = useState(null);
        useEffect(() => {}, []);
        return <div>Test</div>;
      };
    `;

    const graph = buildComponentGraph(code, 'test.tsx');
    const components = Array.from(graph.components.values());
    expect(components[0].hooks).toContain('useState');
    expect(components[0].hooks).toContain('useEffect');
  });

  it('should detect taint sources from URL parameters', () => {
    const code = `
      export const TestComponent = () => {
        const [searchParams] = useSearchParams();
        const urlParam = searchParams.get('redirect');
        return <div>{urlParam}</div>;
      };
    `;

    const graph = buildComponentGraph(code, 'test.tsx');
    expect(graph.taintSources.length).toBeGreaterThan(0);
    expect(graph.taintSources[0].type).toBe('url-param');
  });

  it('should detect taint sinks like navigate()', () => {
    const code = `
      export const TestComponent = () => {
        const navigate = useNavigate();
        navigate('/home');
        return <div>Test</div>;
      };
    `;

    const graph = buildComponentGraph(code, 'test.tsx');
    expect(graph.taintSinks.length).toBeGreaterThan(0);
    expect(graph.taintSinks[0].type).toBe('navigate');
  });

  it('should detect localStorage.setItem as a sink', () => {
    const code = `
      export const TestComponent = () => {
        localStorage.setItem('key', 'value');
        return <div>Test</div>;
      };
    `;

    const graph = buildComponentGraph(code, 'test.tsx');
    expect(graph.taintSinks.length).toBeGreaterThan(0);
    expect(graph.taintSinks[0].type).toBe('localStorage.setItem');
  });
});

describe('Taint Analyzer', () => {
  it('should identify tainted variables from URL params', () => {
    const code = `
      export const TestComponent = () => {
        const [searchParams] = useSearchParams();
        const urlParam = searchParams.get('redirect');
        return <div>{urlParam}</div>;
      };
    `;

    const result = isTainted({ type: 'Identifier', name: 'urlParam' }, 'test.tsx', code);
    expect(result).toBe(true);
  });

  it('should propagate taint through state updates', () => {
    const code = `
      export const TestComponent = () => {
        const [searchParams] = useSearchParams();
        const [redirectUrl, setRedirectUrl] = useState('');
        const urlParam = searchParams.get('redirect');
        setRedirectUrl(urlParam);
        return <div>{redirectUrl}</div>;
      };
    `;

    const result = isTainted({ type: 'Identifier', name: 'redirectUrl' }, 'test.tsx', code);
    expect(result).toBe(true);
  });

  it('should not mark clean variables as tainted', () => {
    const code = `
      export const TestComponent = () => {
        const cleanData = 'safe-value';
        return <div>{cleanData}</div>;
      };
    `;

    const result = isTainted({ type: 'Identifier', name: 'cleanData' }, 'test.tsx', code);
    expect(result).toBe(false);
  });

  it('should not mark navigate itself as tainted', () => {
    const code = `
      export const TestComponent = () => {
        const navigate = useNavigate();
        navigate('/home');
        return <div>Test</div>;
      };
    `;

    const result = isTainted({ type: 'Identifier', name: 'navigate' }, 'test.tsx', code);
    expect(result).toBe(false);
  });
});

describe('Nomenclature Analyzer', () => {
  it('should detect sensitive keywords in variable names', () => {
    const result = hasSensitiveNomenclature({ type: 'Identifier', name: 'token' });
    expect(result).toBe(true);
  });

  it('should detect sensitive keywords in compound names', () => {
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'authToken' })).toBe(true);
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'sessionId' })).toBe(true);
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'apiKey' })).toBe(true);
  });

  it('should detect sensitive function names', () => {
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'getAuthToken' })).toBe(true);
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'createSession' })).toBe(true);
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'saveCredentials' })).toBe(true);
  });

  it('should not flag clean variable names', () => {
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'data' })).toBe(false);
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'user' })).toBe(false);
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'count' })).toBe(false);
  });

  it('should provide context analysis', () => {
    const result = analyzeSensitiveContext({ type: 'Identifier', name: 'token' });
    expect(result.isSensitive).toBe(true);
    expect(result.confidence).toBe('high');
    expect(result.reason).toContain('token');
  });

  it('should provide lower confidence for partial matches', () => {
    const result = analyzeSensitiveContext({ type: 'Identifier', name: 'userDataToken' });
    expect(result.isSensitive).toBe(true);
    expect(result.confidence).toBe('medium');
  });
});

describe('Integration Tests', () => {
  it('should detect tainted navigation security violation', () => {
    const code = `
      export const TestComponent = () => {
        const navigate = useNavigate();
        const [searchParams] = useSearchParams();
        const [redirectUrl, setRedirectUrl] = useState('');
        const urlParam = searchParams.get('redirect');
        setRedirectUrl(urlParam);
        navigate(redirectUrl);
        return <div>Test</div>;
      };
    `;

    const isTaintedUrl = isTainted({ type: 'Identifier', name: 'redirectUrl' }, 'test.tsx', code);
    expect(isTaintedUrl).toBe(true);
  });

  it('should detect sensitive data in localStorage', () => {
    const code = `
      export const TestComponent = () => {
        const authToken = getAuthToken();
        localStorage.setItem('token', authToken);
        return <div>Test</div>;
      };
    `;

    const isSensitive = hasSensitiveNomenclature({ type: 'Identifier', name: 'authToken' }, code);
    expect(isSensitive).toBe(true);
  });
});
