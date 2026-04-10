import { buildComponentGraph, isTainted, hasSensitiveNomenclature } from '@react-banking-security-linter/core-engine';

const testCode = `
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const TaintedNavigationComponent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    const urlParam = searchParams.get('redirect');
    if (urlParam) {
      setRedirectUrl(urlParam);
    }
  }, [searchParams]);

  const handleLogin = () => {
    navigate(redirectUrl);
  };

  return (
    <div>
      <h2>Login Page</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};
`;

console.log('Building component graph...');
const graph = buildComponentGraph(testCode, 'test.tsx');

console.log('Components:', graph.components.size);
console.log('Variables:', graph.variables.size);
console.log('Data flow edges:', graph.dataFlow.length);
console.log('Taint sources:', graph.taintSources.length);
console.log('Taint sinks:', graph.taintSinks.length);

console.log('\nTaint sources:');
graph.taintSources.forEach(source => {
  console.log(`  - ${source.identifier} (${source.type}) at line ${source.line}`);
});

console.log('\nTaint sinks:');
graph.taintSinks.forEach(sink => {
  console.log(`  - ${sink.identifier} (${sink.type}) at line ${sink.line}`);
});

console.log('\nVariables:');
graph.variables.forEach((variable, name) => {
  console.log(`  - ${name}: tainted=${variable.isTainted}, state=${variable.isState}`);
});

console.log('\nData flow edges:');
graph.dataFlow.forEach(edge => {
  console.log(`  - ${edge.source} -> ${edge.target} (${edge.edgeType})`);
});

console.log('\nTesting isTainted():');
console.log(`  - urlParam: ${isTainted({ type: 'Identifier', name: 'urlParam' }, 'test.tsx', testCode)}`);
console.log(`  - redirectUrl: ${isTainted({ type: 'Identifier', name: 'redirectUrl' }, 'test.tsx', testCode)}`);
console.log(`  - navigate: ${isTainted({ type: 'Identifier', name: 'navigate' }, 'test.tsx', testCode)}`);

const sensitiveTestCode = `
import React, { useState } from 'react';

export const Test = () => {
  const [authToken, setAuthToken] = useState('');
  
  const token = getAuthToken();
  localStorage.setItem('token', token);
  
  return <div>Test</div>;
};
`;

console.log('\nTesting hasSensitiveNomenclature():');
console.log(`  - 'token' variable: ${hasSensitiveNomenclature({ type: 'Identifier', name: 'token' }, sensitiveTestCode)}`);
console.log(`  - 'authToken' variable: ${hasSensitiveNomenclature({ type: 'Identifier', name: 'authToken' }, sensitiveTestCode)}`);
console.log(`  - 'getAuthToken' function: ${hasSensitiveNomenclature({ type: 'Identifier', name: 'getAuthToken' }, sensitiveTestCode)}`);
console.log(`  - 'data' variable: ${hasSensitiveNomenclature({ type: 'Identifier', name: 'data' }, sensitiveTestCode)}`);
