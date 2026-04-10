import { ComponentGraph, VariableNode, DataFlowEdge } from './types';

export class TaintAnalyzer {
  private graph: ComponentGraph;
  private visited: Set<string> = new Set();

  constructor(graph: ComponentGraph) {
    this.graph = graph;
  }

  isTainted(variableName: string): boolean {
    const variable = this.graph.variables.get(variableName);
    if (!variable) return false;

    this.visited.clear();
    return this.checkTaintRecursively(variableName);
  }

  private checkTaintRecursively(variableName: string): boolean {
    if (this.visited.has(variableName)) {
      return false;
    }
    this.visited.add(variableName);

    const variable = this.graph.variables.get(variableName);
    if (!variable) return false;

    if (variable.isTainted) {
      return true;
    }

    if (variable.dataFlowSources.length === 0) {
      return false;
    }

    for (const sourceName of variable.dataFlowSources) {
      if (this.checkTaintRecursively(sourceName)) {
        return true;
      }
    }

    return false;
  }

  isTaintedSource(variableName: string): boolean {
    return this.graph.taintSources.some(source => source.identifier === variableName);
  }

  isTaintedNode(variableName: string): boolean {
    const variable = this.graph.variables.get(variableName);
    return variable?.isTainted || false;
  }

  getTaintedVariables(): VariableNode[] {
    const tainted: VariableNode[] = [];
    for (const variable of this.graph.variables.values()) {
      if (variable.isTainted) {
        tainted.push(variable);
      }
    }
    return tainted;
  }

  getDataFlowPath(sourceName: string, targetName: string): DataFlowEdge[] {
    const path: DataFlowEdge[] = [];
    const visited = new Set<string>();

    this.findPath(sourceName, targetName, path, visited);
    return path;
  }

  private findPath(
    current: string,
    target: string,
    path: DataFlowEdge[],
    visited: Set<string>
  ): boolean {
    if (current === target) {
      return true;
    }

    if (visited.has(current)) {
      return false;
    }
    visited.add(current);

    for (const edge of this.graph.dataFlow) {
      if (edge.source === current) {
        path.push(edge);
        if (this.findPath(edge.target, target, path, visited)) {
          return true;
        }
        path.pop();
      }
    }

    return false;
  }
}
