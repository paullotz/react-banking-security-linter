import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildComponentGraph } from '@react-banking-security-linter/core-engine';
import fs from 'fs';
import path from 'path';

// Import test components
import * as positiveControls from '../test-components/PositiveControls';
import * as negativeControls from '../test-components/NegativeControls';
import * as dataFlowScenarios from '../test-components/DataFlowScenarios';
import * as navigationSecurityTest from '../test-components/NavigationSecurityTest';
import * as dataComplianceTest from '../test-components/DataComplianceTest';

// Synthetic components for scaling tests
const syntheticComponents = {
  tiny: `import React from 'react';
export const TinyComponent = () => {
  return <div>Test</div>;
};`,

  small: `import React, { useState } from 'react';
export const SmallComponent = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
};`,

  medium: `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const MediumComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/data').then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);
  
  const handleClick = () => {
    navigate('/dashboard');
  };
  
  return (
    <div>
      {loading ? <p>Loading...</p> : <p>{data}</p>}
      <button onClick={handleClick}>Go to Dashboard</button>
    </div>
  );
};`,

  large: `import React, { useState, useEffect, useCallback, useMemo, useContext, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, useParams } from 'react-router-dom';
import AuthContext from './AuthContext';

export const LargeBankingComponent = ({ initialToken, userData }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userToken, setUserToken] = useState(initialToken);
  const [sessionKey, setSessionKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const params = useParams();
  const authContext = useContext(AuthContext);
  
  const urlParam1 = searchParams.get('redirect');
  const urlParam2 = searchParams.get('returnUrl');
  const urlParam3 = searchParams.get('callback');
  
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  
  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/balance', {
        headers: { Authorization: 'Bearer ' + userToken }
      });
      const data = await response.json();
      setBalance(data.balance);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);
  
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transactions', {
        headers: { Authorization: 'Bearer ' + userToken }
      });
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);
  
  const handleLogout = () => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('sessionKey', sessionKey);
    localStorage.setItem('apiSecret', apiSecret);
    navigate('/logout');
  };
  
  const handleRedirect = () => {
    if (urlParam1) {
      navigate(urlParam1);
    } else if (urlParam2) {
      navigate(urlParam2);
    } else if (urlParam3) {
      navigate(urlParam3);
    }
  };
  
  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    
    const savedToken = localStorage.getItem('savedToken');
    if (savedToken) {
      setUserToken(savedToken);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchBalance, fetchTransactions]);
  
  const sensitiveData = useMemo(() => ({
    token: userToken,
    session: sessionKey,
    secret: apiSecret,
    auth: authContext.token
  }), [userToken, sessionKey, apiSecret, authContext.token]);
  
  if (location.pathname.includes('admin') && !userToken) {
    navigate('/login?redirect=' + encodeURIComponent(location.pathname));
  }
  
  return (
    <div ref={inputRef}>
      <h1>Banking Dashboard</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <p>Balance: {balance}</p>
      <button onClick={handleRedirect}>Process</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};`
};

// Helper function to extract component names
function getComponentNames(module: any): string[] {
  return Object.keys(module).filter(key => 
    typeof module[key] === 'function' && 
    /^[A-Z]/.test(key) &&
    key !== 'default'
  );
}

// Performance test result interface
interface PerformanceResult {
  componentName: string;
  category: string;
  duration: number;
  lines: number;
  passes: boolean;
  components: number;
  variables: number;
  edges: number;
}

describe('Performance Validation for Thesis Claim', () => {
  const results: PerformanceResult[] = [];
  let totalComponents = 0;
  let passCount = 0;
  
  beforeAll(() => {
    console.log('=== Thesis Performance Validation ===');
    console.log('Claim: "For 95 percent of tested components, analysis completes in under 100 milliseconds"\n');
  });
  
  afterAll(() => {
    // Calculate statistics
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const passRate = (passCount / totalComponents) * 100;
    const maxDuration = Math.max(...results.map(r => r.duration));
    const minDuration = Math.min(...results.map(r => r.duration));
    
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total components tested: ${totalComponents}`);
    console.log(`Components passing 100ms threshold: ${passCount}`);
    console.log(`Pass rate: ${passRate.toFixed(1)}%`);
    console.log(`Average analysis time: ${avgDuration.toFixed(2)}ms`);
    console.log(`Minimum analysis time: ${minDuration.toFixed(2)}ms`);
    console.log(`Maximum analysis time: ${maxDuration.toFixed(2)}ms`);
    console.log(`Thesis claim (95% pass rate): ${passRate >= 95 ? '✓ VERIFIED' : '✗ NOT VERIFIED'}`);
    
    // Generate LaTeX table data
    console.log('\n=== LaTeX Table Data ===');
    console.log('Component & Time (ms) & $\\le$100ms & Lines & Comps & Vars & Edges \\\\ \\hline');
    results.forEach(result => {
      const checkmark = result.passes ? '$\\checkmark$' : '✗';
      console.log(`${result.componentName} & ${result.duration.toFixed(2)} & ${checkmark} & ${result.lines} & ${result.components} & ${result.variables} & ${result.edges} \\\\ \\hline`);
    });
  });
  
  // Test Positive Controls
  describe('Positive Controls (PC)', () => {
    const componentNames = getComponentNames(positiveControls);
    
    componentNames.forEach(componentName => {
      it(`PC: ${componentName} should analyze within 100ms`, () => {
        totalComponents++;
        
        // Read the source file to get the actual code
        const filePath = path.join(__dirname, '../test-components/PositiveControls.tsx');
        const sourceCode = fs.readFileSync(filePath, 'utf8');
        
        // Extract component code (simplified - use whole file for now)
        const start = performance.now();
        const graph = buildComponentGraph(sourceCode, 'PositiveControls.tsx');
        const end = performance.now();
        
        const duration = end - start;
        const lines = sourceCode.split('\n').length;
        const passes = duration <= 100;
        
        if (passes) passCount++;
        
        results.push({
          componentName: `PC: ${componentName}`,
          category: 'Positive Control',
          duration: parseFloat(duration.toFixed(2)),
          lines,
          passes,
          components: graph.components.size,
          variables: graph.variables.size,
          edges: graph.dataFlow.length
        });
        
        console.log(`PC: ${componentName.padEnd(30)}: ${duration.toFixed(2).padStart(6)}ms (${passes ? 'PASS' : 'FAIL'})`);
        expect(duration).toBeLessThanOrEqual(100);
      });
    });
  });
  
  // Test Negative Controls
  describe('Negative Controls (NC)', () => {
    const componentNames = getComponentNames(negativeControls);
    
    componentNames.forEach(componentName => {
      it(`NC: ${componentName} should analyze within 100ms`, () => {
        totalComponents++;
        
        const filePath = path.join(__dirname, '../test-components/NegativeControls.tsx');
        const sourceCode = fs.readFileSync(filePath, 'utf8');
        
        const start = performance.now();
        const graph = buildComponentGraph(sourceCode, 'NegativeControls.tsx');
        const end = performance.now();
        
        const duration = end - start;
        const lines = sourceCode.split('\n').length;
        const passes = duration <= 100;
        
        if (passes) passCount++;
        
        results.push({
          componentName: `NC: ${componentName}`,
          category: 'Negative Control',
          duration: parseFloat(duration.toFixed(2)),
          lines,
          passes,
          components: graph.components.size,
          variables: graph.variables.size,
          edges: graph.dataFlow.length
        });
        
        console.log(`NC: ${componentName.padEnd(30)}: ${duration.toFixed(2).padStart(6)}ms (${passes ? 'PASS' : 'FAIL'})`);
        expect(duration).toBeLessThanOrEqual(100);
      });
    });
  });
  
  // Test Data Flow Scenarios
  describe('Data Flow Scenarios (DF)', () => {
    const componentNames = getComponentNames(dataFlowScenarios);
    
    componentNames.forEach(componentName => {
      it(`DF: ${componentName} should analyze within 100ms`, () => {
        totalComponents++;
        
        const filePath = path.join(__dirname, '../test-components/DataFlowScenarios.tsx');
        const sourceCode = fs.readFileSync(filePath, 'utf8');
        
        const start = performance.now();
        const graph = buildComponentGraph(sourceCode, 'DataFlowScenarios.tsx');
        const end = performance.now();
        
        const duration = end - start;
        const lines = sourceCode.split('\n').length;
        const passes = duration <= 100;
        
        if (passes) passCount++;
        
        results.push({
          componentName: `DF: ${componentName}`,
          category: 'Data Flow',
          duration: parseFloat(duration.toFixed(2)),
          lines,
          passes,
          components: graph.components.size,
          variables: graph.variables.size,
          edges: graph.dataFlow.length
        });
        
        console.log(`DF: ${componentName.padEnd(30)}: ${duration.toFixed(2).padStart(6)}ms (${passes ? 'PASS' : 'FAIL'})`);
        expect(duration).toBeLessThanOrEqual(100);
      });
    });
  });
  
  // Test Navigation Security Components
  describe('Navigation Security Components (NS)', () => {
    const componentNames = getComponentNames(navigationSecurityTest);
    
    componentNames.forEach(componentName => {
      it(`NS: ${componentName} should analyze within 100ms`, () => {
        totalComponents++;
        
        const filePath = path.join(__dirname, '../test-components/NavigationSecurityTest.tsx');
        const sourceCode = fs.readFileSync(filePath, 'utf8');
        
        const start = performance.now();
        const graph = buildComponentGraph(sourceCode, 'NavigationSecurityTest.tsx');
        const end = performance.now();
        
        const duration = end - start;
        const lines = sourceCode.split('\n').length;
        const passes = duration <= 100;
        
        if (passes) passCount++;
        
        results.push({
          componentName: `NS: ${componentName}`,
          category: 'Navigation Security',
          duration: parseFloat(duration.toFixed(2)),
          lines,
          passes,
          components: graph.components.size,
          variables: graph.variables.size,
          edges: graph.dataFlow.length
        });
        
        console.log(`NS: ${componentName.padEnd(30)}: ${duration.toFixed(2).padStart(6)}ms (${passes ? 'PASS' : 'FAIL'})`);
        expect(duration).toBeLessThanOrEqual(100);
      });
    });
  });
  
  // Test Data Compliance Components
  describe('Data Compliance Components (DC)', () => {
    const componentNames = getComponentNames(dataComplianceTest);
    
    componentNames.forEach(componentName => {
      it(`DC: ${componentName} should analyze within 100ms`, () => {
        totalComponents++;
        
        const filePath = path.join(__dirname, '../test-components/DataComplianceTest.tsx');
        const sourceCode = fs.readFileSync(filePath, 'utf8');
        
        const start = performance.now();
        const graph = buildComponentGraph(sourceCode, 'DataComplianceTest.tsx');
        const end = performance.now();
        
        const duration = end - start;
        const lines = sourceCode.split('\n').length;
        const passes = duration <= 100;
        
        if (passes) passCount++;
        
        results.push({
          componentName: `DC: ${componentName}`,
          category: 'Data Compliance',
          duration: parseFloat(duration.toFixed(2)),
          lines,
          passes,
          components: graph.components.size,
          variables: graph.variables.size,
          edges: graph.dataFlow.length
        });
        
        console.log(`DC: ${componentName.padEnd(30)}: ${duration.toFixed(2).padStart(6)}ms (${passes ? 'PASS' : 'FAIL'})`);
        expect(duration).toBeLessThanOrEqual(100);
      });
    });
  });
  
  // Test Synthetic Components
  describe('Synthetic Components (Scaling Test)', () => {
    Object.entries(syntheticComponents).forEach(([name, code]) => {
      it(`Synthetic: ${name} should analyze within 100ms`, () => {
        totalComponents++;
        
        const start = performance.now();
        const graph = buildComponentGraph(code, `synthetic-${name}.tsx`);
        const end = performance.now();
        
        const duration = end - start;
        const lines = code.split('\n').length;
        const passes = duration <= 100;
        
        if (passes) passCount++;
        
        results.push({
          componentName: `Synth: ${name}`,
          category: 'Synthetic',
          duration: parseFloat(duration.toFixed(2)),
          lines,
          passes,
          components: graph.components.size,
          variables: graph.variables.size,
          edges: graph.dataFlow.length
        });
        
        console.log(`Synth: ${name.padEnd(30)}: ${duration.toFixed(2).padStart(6)}ms (${passes ? 'PASS' : 'FAIL'})`);
        expect(duration).toBeLessThanOrEqual(100);
      });
    });
  });
});