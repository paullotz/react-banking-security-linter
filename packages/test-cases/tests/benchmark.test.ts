import { describe, it, expect } from 'vitest';
import {
  buildComponentGraph,
  isTainted,
  hasSensitiveNomenclature,
  analyzeSensitiveContext
} from '@react-banking-security-linter/core-engine';

describe('Benchmark: Positive Controls', () => {
  const PC01_CODE = `
    export const PC01_UrlParamToNavigate = () => {
      const navigate = useNavigate();
      const [searchParams] = useSearchParams();
      const [redirectUrl, setRedirectUrl] = useState('');
      const urlParam = searchParams.get('redirect');
      setRedirectUrl(urlParam);
      navigate(redirectUrl);
      return <div>Test</div>;
    };
  `;

  it('PC-01: URL param through state to navigate', () => {
    expect(isTainted({ type: 'Identifier', name: 'redirectUrl' }, 'pc01.tsx', PC01_CODE)).toBe(true);
  });

  const PC02_CODE = `
    export const PC02_DomInputToNavigate = () => {
      const navigate = useNavigate();
      const [userInput, setUserInput] = useState('');
      const handleSubmit = (e) => {
        e.preventDefault();
        navigate(userInput);
      };
      setUserInput(e.target.value);
      return <form onSubmit={handleSubmit}><input onChange={(e) => setUserInput(e.target.value)} /></form>;
    };
  `;

  it('PC-02: DOM input through state to navigate', () => {
    const graph = buildComponentGraph(PC02_CODE, 'pc02.tsx');
    const stateVar = graph.variables.get('userInput');
    expect(stateVar?.isTainted).toBe(true);
  });

  it('PC-03: Token stored in localStorage - nomenclature detection', () => {
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'token' })).toBe(true);
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'authToken' })).toBe(true);
  });

  it('PC-04: Session identifier stored in localStorage - nomenclature detection', () => {
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'newSession' })).toBe(true);
  });

  it('PC-05: Auth data stored in localStorage - nomenclature detection', () => {
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'authData' })).toBe(true);
    const result = analyzeSensitiveContext({ type: 'Identifier', name: 'authData' });
    expect(result.isSensitive).toBe(true);
  });
});

describe('Benchmark: Negative Controls', () => {
  it('NC-01: Hardcoded route "/dashboard" is not tainted', () => {
    const code = `
      export const Test = () => {
        const navigate = useNavigate();
        navigate('/dashboard');
        return <div>Test</div>;
      };
    `;
    const result = isTainted({ type: 'Literal', value: '/dashboard' }, 'nc01.tsx', code);
    expect(result).toBe(false);
  });

  it('NC-02: Constant reference is not tainted', () => {
    const code = `
      export const Test = () => {
        const navigate = useNavigate();
        const LOGOUT_URL = '/logout';
        navigate(LOGOUT_URL);
        return <div>Test</div>;
      };
    `;
    const result = isTainted({ type: 'Identifier', name: 'LOGOUT_URL' }, 'nc02.tsx', code);
    expect(result).toBe(false);
  });

  it('NC-03: Non-sensitive data (theme) is not flagged', () => {
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'theme' })).toBe(false);
  });

  it('NC-04: Non-sensitive compound data (userPrefs) is not flagged', () => {
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'userPrefs' })).toBe(false);
  });

  it('NC-05: URL param that never reaches a sink does not produce taint sink error', () => {
    const code = `
      export const Test = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const lang = searchParams.get('lang') || 'en';
        return <p>{lang}</p>;
      };
    `;
    const graph = buildComponentGraph(code, 'nc05.tsx');
    const navigateSinks = graph.taintSinks.filter(s => s.type === 'navigate');
    expect(navigateSinks.length).toBe(0);
  });
});

describe('Benchmark: Data Flow Scenarios', () => {
  it('DF-01: URL param through logical OR assignment to state to navigate', () => {
    const code = `
      export const Test = () => {
        const navigate = useNavigate();
        const [searchParams] = useSearchParams();
        const [redirectUrl, setRedirectUrl] = useState('');
        const rawParam = searchParams.get('url');
        const sanitizedParam = rawParam || '';
        setRedirectUrl(sanitizedParam);
        navigate(redirectUrl);
        return <div>Test</div>;
      };
    `;
    expect(isTainted({ type: 'Identifier', name: 'redirectUrl' }, 'df01.tsx', code)).toBe(true);
  });

  it('DF-02: DOM input through intermediate variable to state to navigate', () => {
    const code = `
      export const Test = () => {
        const navigate = useNavigate();
        const [destination, setDestination] = useState('');
        const handleInputChange = (e) => {
          const rawInput = e.target.value;
          setDestination(rawInput);
        };
        navigate(destination);
        return <div>Test</div>;
      };
    `;
    expect(isTainted({ type: 'Identifier', name: 'destination' }, 'df02.tsx', code)).toBe(true);
  });

  it('DF-03: Sensitive function return stored in localStorage', () => {
    const code = `
      export const Test = () => {
        const getSecretToken = () => { return 'jwt-abc'; };
        const myToken = getSecretToken();
        localStorage.setItem('app-token', myToken);
        return <div>Test</div>;
      };
    `;
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'myToken' }, code)).toBe(true);
  });

  it('DF-04: URL param through conditional branch to navigate', () => {
    const code = `
      export const Test = () => {
        const navigate = useNavigate();
        const [searchParams] = useSearchParams();
        const [targetUrl, setTargetUrl] = useState('');
        const urlParam = searchParams.get('next');
        if (urlParam) { setTargetUrl(urlParam); }
        navigate(targetUrl);
        return <div>Test</div>;
      };
    `;
    expect(isTainted({ type: 'Identifier', name: 'targetUrl' }, 'df04.tsx', code)).toBe(true);
  });

  it('DF-05: Multiple sensitive variables detected in sequence', () => {
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'accessToken' })).toBe(true);
    expect(hasSensitiveNomenclature({ type: 'Identifier', name: 'refreshToken' })).toBe(true);
  });
});
