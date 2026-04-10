import * as ts from 'typescript';
import { GraphBuilder } from './graph-builder';
import { TaintAnalyzer } from './taint-analyzer';
import { NomenclatureAnalyzer } from './nomenclature-analyzer';
import { ComponentGraph } from './types';

const graphCache = new Map<string, ComponentGraph>();

export function walkAST(sourceCode: string): void {
  const sourceFile = ts.createSourceFile(
    'dummy.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  let nodeCount = 0;

  function visit(node: ts.Node) {
    nodeCount++;
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  console.log(`Walked ${nodeCount} nodes`);
}

export function buildComponentGraph(sourceCode: string, filename: string): ComponentGraph {
  const graphBuilder = new GraphBuilder(filename);
  return graphBuilder.build(sourceCode);
}

export function isTainted(node: any, filename?: string, sourceCode?: string): boolean {
  if (!node) return false;

  const variableName = extractVariableName(node);
  if (!variableName) return false;

  const cacheKey = filename || 'unknown';
  let graph: ComponentGraph;

  if (sourceCode) {
    graph = buildComponentGraph(sourceCode, cacheKey);
    graphCache.set(cacheKey, graph);
  } else if (graphCache.has(cacheKey)) {
    graph = graphCache.get(cacheKey)!;
  } else {
    return false;
  }

  const taintAnalyzer = new TaintAnalyzer(graph);
  return taintAnalyzer.isTainted(variableName);
}

export function hasSensitiveNomenclature(node: any, sourceCode?: string): boolean {
  if (!node) return false;

  const nomenclatureAnalyzer = new NomenclatureAnalyzer();
  return nomenclatureAnalyzer.hasSensitiveNomenclature(node, sourceCode);
}

export function analyzeSensitiveContext(node: any, sourceCode?: string): {
  isSensitive: boolean;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
} {
  if (!node) {
    return {
      isSensitive: false,
      reason: 'No node provided',
      confidence: 'low'
    };
  }

  const nomenclatureAnalyzer = new NomenclatureAnalyzer();
  return nomenclatureAnalyzer.analyzeContext(node, sourceCode);
}

function extractVariableName(node: any): string | null {
  if (!node) return null;

  const nodeType = node.type;

  if (nodeType === 'Identifier') {
    return node.name;
  }

  if (nodeType === 'MemberExpression') {
    if (node.object && node.object.type === 'Identifier') {
      return node.object.name;
    }
  }

  return null;
}

export function clearGraphCache(): void {
  graphCache.clear();
}

export function getGraphCacheSize(): number {
  return graphCache.size;
}

export { GraphBuilder, TaintAnalyzer, NomenclatureAnalyzer };
export * from './types';
export * from './react-analyzer';