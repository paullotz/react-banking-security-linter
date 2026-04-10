import * as ts from 'typescript';
import { SensitiveDataPattern } from './types';

export class NomenclatureAnalyzer {
  private sensitiveKeywords: string[];
  private sensitiveFunctionPatterns: RegExp[];
  private sensitiveStringPatterns: RegExp[];

  constructor() {
    this.sensitiveKeywords = [
      'token',
      'session',
      'auth',
      'password',
      'credential',
      'apikey',
      'api_key',
      'secret',
      'jwt',
      'oauth',
      'refreshToken',
      'access_token',
      'id_token',
      'sessionId',
      'authToken',
      'userCredentials',
      'apiSecret'
    ];

    this.sensitiveFunctionPatterns = [
      /get(Auth|Token|Session|Credential|Secret|ApiKey)/i,
      /create(Session|Token|Credential)/i,
      /save(Auth|Token|Credential|Session)/i,
      /set(Auth|Token|Credential|Session)/i,
      /generate(Token|Session|Credential)/i
    ];

    this.sensitiveStringPatterns = [
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, // JWT format
      /^Bearer\s+[A-Za-z0-9\-._~+\/]+=*$/, // Bearer token
      / ey[A-Za-z0-9_-]+\.ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ // JWT in content
    ];
  }

  hasSensitiveNomenclature(node: any, sourceCode?: string): boolean {
    if (!node) return false;

    const nodeType = node.type;

    if (nodeType === 'Identifier') {
      return this.checkIdentifier(node.name, sourceCode);
    }

    if (nodeType === 'MemberExpression') {
      const propertyName = this.extractPropertyName(node);
      if (propertyName) {
        return this.checkIdentifier(propertyName, sourceCode);
      }
      if (node.object) {
        return this.hasSensitiveNomenclature(node.object, sourceCode);
      }
    }

    if (nodeType === 'CallExpression') {
      const callee = node.callee;
      
      if (callee.type === 'Identifier') {
        if (this.checkFunctionName(callee.name)) {
          return true;
        }
      }

      if (callee.type === 'MemberExpression') {
        const methodName = this.extractPropertyName(callee);
        if (methodName && this.checkFunctionName(methodName)) {
          return true;
        }
      }

      if (node.arguments && node.arguments.length > 0) {
        for (const arg of node.arguments) {
          if (this.hasSensitiveNomenclature(arg, sourceCode)) {
            return true;
          }
        }
      }
    }

    if (nodeType === 'Literal' && typeof node.value === 'string') {
      return this.checkStringLiteral(node.value);
    }

    return false;
  }

  private checkIdentifier(name: string, sourceCode?: string): boolean {
    if (!name) return false;

    const lowerName = name.toLowerCase();

    for (const keyword of this.sensitiveKeywords) {
      if (lowerName.includes(keyword)) {
        return true;
      }
    }

    return false;
  }

  private checkFunctionName(functionName: string): boolean {
    if (!functionName) return false;

    for (const pattern of this.sensitiveFunctionPatterns) {
      if (pattern.test(functionName)) {
        return true;
      }
    }

    return false;
  }

  private checkStringLiteral(value: string): boolean {
    if (!value) return false;

    for (const pattern of this.sensitiveStringPatterns) {
      if (pattern.test(value)) {
        return true;
      }
    }

    return false;
  }

  private extractPropertyName(memberExpression: any): string | null {
    if (!memberExpression || !memberExpression.property) return null;

    if (memberExpression.property.type === 'Identifier') {
      return memberExpression.property.name;
    }

    return null;
  }

  getSensitiveKeywords(): string[] {
    return [...this.sensitiveKeywords];
  }

  isSensitiveData(data: any): boolean {
    if (typeof data === 'string') {
      return this.checkStringLiteral(data);
    }

    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      for (const key of keys) {
        if (this.checkIdentifier(key)) {
          return true;
        }
      }
    }

    return false;
  }

  analyzeContext(node: any, sourceCode?: string): {
    isSensitive: boolean;
    reason: string;
    confidence: 'high' | 'medium' | 'low';
  } {
    if (this.hasSensitiveNomenclature(node, sourceCode)) {
      const nodeType = node?.type || 'unknown';
      
      let confidence: 'high' | 'medium' | 'low' = 'low';
      let reason = 'Matches sensitive data pattern';

      if (nodeType === 'Identifier') {
        const lowerName = node.name.toLowerCase();
        
        if (lowerName === 'token' || lowerName === 'auth' || lowerName === 'session') {
          confidence = 'high';
          reason = `Direct match with critical keyword: ${node.name}`;
        } else if (lowerName.includes('token') || lowerName.includes('auth')) {
          confidence = 'medium';
          reason = `Contains sensitive keyword: ${node.name}`;
        }
      }

      if (nodeType === 'CallExpression') {
        const callee = node.callee;
        if (callee.type === 'Identifier') {
          confidence = 'high';
          reason = `Function suggests sensitive data: ${callee.name}`;
        }
      }

      return {
        isSensitive: true,
        reason,
        confidence
      };
    }

    return {
      isSensitive: false,
      reason: 'No sensitive patterns detected',
      confidence: 'low'
    };
  }
}
