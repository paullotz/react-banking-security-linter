import { describe, it, expect } from 'vitest';
import {
  buildComponentGraph,
  isTainted,
  hasSensitiveNomenclature,
  walkAST
} from '@react-banking-security-linter/core-engine';

describe('Performance Unit Tests (Individual Operations)', () => {
  it('should build component graph in less than 100ms for complex component', () => {
    const complexReactComponent = `
      import React, { useState, useEffect } from 'react';
      import { useNavigate, useSearchParams } from 'react-router-dom';

      export const SecureDashboard = ({ userToken }: { userToken: string }) => {
        const [data, setData] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const navigate = useNavigate();
        const [searchParams] = useSearchParams();

        useEffect(() => {
          const fetchData = async () => {
            setIsLoading(true);
            try {
              const response = await fetch('/api/data');
              const json = await response.json();
              setData(json.data);
            } catch (error) {
              console.error('Error fetching data:', error);
            } finally {
              setIsLoading(false);
            }
          };
          fetchData();
        }, []);

        const handleLogout = () => {
          localStorage.removeItem('token');
          navigate('/login');
        };

        const urlParam = searchParams.get('redirect');
        if (urlParam) {
          navigate(urlParam);
        }

        return (
          <div>
            <h1>Welcome to the secure dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
            {isLoading ? <p>Loading...</p> : <div>{data}</div>}
          </div>
        );
      };
    `;

    const start = performance.now();
    const graph = buildComponentGraph(complexReactComponent, 'complex.tsx');
    const end = performance.now();

    const duration = end - start;
    console.log(`Component graph construction: ${duration.toFixed(2)}ms`);
    
    expect(duration).toBeLessThanOrEqual(100);
    expect(graph.components.size).toBeGreaterThan(0);
  });

  it('should perform taint analysis in less than 100ms', () => {
    const code = `
      import React, { useState, useEffect } from 'react';
      import { useNavigate, useSearchParams } from 'react-router-dom';

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

    const start = performance.now();
    const result = isTainted({ type: 'Identifier', name: 'redirectUrl' }, 'test.tsx', code);
    const end = performance.now();

    const duration = end - start;
    console.log(`Taint analysis: ${duration.toFixed(2)}ms, result: ${result}`);
    expect(duration).toBeLessThanOrEqual(100);
    expect(result).toBe(true);
  });

  it('should perform nomenclature analysis in less than 100ms', () => {
    const code = `
      import React from 'react';

      export const TestComponent = () => {
        const authToken = getAuthToken();
        const sessionId = createSession();
        const apiKey = getApiKey();
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('session', sessionId);
        localStorage.setItem('apiKey', apiKey);
        
        return <div>Test</div>;
      };
    `;

    const start = performance.now();
    const result1 = hasSensitiveNomenclature({ type: 'Identifier', name: 'authToken' }, code);
    const result2 = hasSensitiveNomenclature({ type: 'Identifier', name: 'sessionId' }, code);
    const result3 = hasSensitiveNomenclature({ type: 'Identifier', name: 'apiKey' }, code);
    const end = performance.now();

    const duration = end - start;
    console.log(`Nomenclature analysis: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThanOrEqual(100);
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });

  it('should execute AST walk in less than 100ms', () => {
    const dummyReactComponent = `
      import React, { useState } from 'react';
      
      export function SecureDashboard({ userToken }) {
        const [data, setData] = useState(null);
        
        return (
          <div>
            <h1>Welcome to the secure dashboard</h1>
          </div>
        );
      }
    `;

    const start = performance.now();
    walkAST(dummyReactComponent);
    const end = performance.now();

    const duration = end - start;
    console.log(`AST walking: ${duration.toFixed(2)}ms`);
    
    expect(duration).toBeLessThanOrEqual(100);
  });
});