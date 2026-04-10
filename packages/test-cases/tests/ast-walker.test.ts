import { describe, it, expect } from 'vitest';
import { walkAST } from '@react-banking-security-linter/core-engine';

describe('AST Walker Performance Benchmark (WP1)', () => {
  it('should execute in less than 100ms', () => {
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
    console.log(`AST walking took ${duration.toFixed(2)}ms`);
    
    // Requirement from thesis WP1: Constraint <= 100ms
    expect(duration).toBeLessThanOrEqual(100);
  });
});
