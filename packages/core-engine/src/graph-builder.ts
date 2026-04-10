import * as ts from 'typescript';
import { ComponentGraph, ComponentNode, VariableNode, DataFlowEdge, TaintSource, TaintSink } from './types';
import { ReactAnalyzer } from './react-analyzer';

export class GraphBuilder {
  private graph: ComponentGraph;
  private reactAnalyzer: ReactAnalyzer;
  private currentComponent: ComponentNode | null = null;
  private fileName: string;
  private sourceFile: ts.SourceFile;

  constructor(fileName: string) {
    this.graph = {
      components: new Map(),
      variables: new Map(),
      dataFlow: [],
      taintSources: [],
      taintSinks: []
    };
    this.reactAnalyzer = new ReactAnalyzer();
    this.fileName = fileName;
    this.sourceFile = ts.createSourceFile(fileName, '', ts.ScriptTarget.Latest, true);
  }

  private getLineAndChar(node: ts.Node): { line: number; character: number } {
    const pos = node.getStart();
    return this.sourceFile.getLineAndCharacterOfPosition(pos);
  }

  build(sourceCode: string): ComponentGraph {
    this.sourceFile = ts.createSourceFile(
      this.fileName,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    this.visit(this.sourceFile);
    return this.graph;
  }

  private visit(node: ts.Node): void {
    if (this.reactAnalyzer.isReactComponent(node)) {
      this.processComponent(node as ts.FunctionDeclaration);
    }

    if (ts.isVariableDeclaration(node)) {
      this.processVariableDeclaration(node);
    }

    if (ts.isCallExpression(node)) {
      this.processCallExpression(node);
    }

    if (ts.isBinaryExpression(node)) {
      this.processBinaryExpression(node);
    }

    ts.forEachChild(node, (child) => this.visit(child));
  }

  private processComponent(node: ts.FunctionDeclaration): void {
    const componentName = this.reactAnalyzer.extractComponentName(node);
    if (!componentName) return;

    const pos = this.getLineAndChar(node);
    const componentNode: ComponentNode = {
      name: componentName,
      fileName: this.fileName,
      line: pos.line,
      column: pos.character,
      props: [],
      hooks: [],
      children: [],
      taintSources: []
    };

    this.currentComponent = componentNode;
    this.graph.components.set(componentName, componentNode);

    if (node.body) {
      this.visit(node.body);
    }
    this.currentComponent = null;
  }

  private processVariableDeclaration(node: ts.VariableDeclaration): void {
    const varName = this.reactAnalyzer.extractVariableName(node.name);
    if (!varName) return;

    const isState = this.reactAnalyzer.isStateVariableDeclaration(node);
    const isTaintedSource = node.initializer && ts.isCallExpression(node.initializer) && this.reactAnalyzer.isTaintSource(node.initializer);

    const isDomSource = !!node.initializer && this.reactAnalyzer.isDomEventValueAccess(node.initializer);

    let taintedFromAssignment = false;
    if (node.initializer && ts.isIdentifier(node.initializer)) {
      const refName = node.initializer.text;
      const refVar = this.graph.variables.get(refName);
      if (refVar?.isTainted) {
        taintedFromAssignment = true;
        this.addDataFlow(refName, varName, 'assignment');
      }
    }

    let taintedFromBinary = false;
    if (node.initializer && ts.isBinaryExpression(node.initializer)) {
      taintedFromBinary = this.checkBinaryExpressionForTaint(node.initializer, varName);
    }

    const pos = this.getLineAndChar(node);
    const isTainted = isTaintedSource || isDomSource || taintedFromAssignment || taintedFromBinary;
    const variableNode: VariableNode = {
      name: varName,
      fileName: this.fileName,
      line: pos.line,
      column: pos.character,
      isTainted: isTainted || false,
      dataFlowSources: [],
      isState,
      isProp: false,
      sourceNode: isTainted ? varName : undefined
    };

    this.graph.variables.set(varName, variableNode);

    if (isTaintedSource && node.initializer) {
      const pos2 = this.getLineAndChar(node);
      const source: TaintSource = {
        type: 'url-param',
        identifier: varName,
        fileName: this.fileName,
        line: pos2.line,
        column: pos2.character
      };
      this.graph.taintSources.push(source);

      if (this.currentComponent) {
        this.currentComponent.taintSources.push(varName);
      }
    }

    if (isDomSource) {
      const pos2 = this.getLineAndChar(node);
      const source: TaintSource = {
        type: 'user-input',
        identifier: varName,
        fileName: this.fileName,
        line: pos2.line,
        column: pos2.character
      };
      this.graph.taintSources.push(source);

      if (this.currentComponent && !this.currentComponent.taintSources.includes(varName)) {
        this.currentComponent.taintSources.push(varName);
      }
    }
  }

  private checkBinaryExpressionForTaint(node: ts.BinaryExpression, targetName: string): boolean {
    const left = node.left;
    const right = node.right;

    for (const operand of [left, right]) {
      if (ts.isIdentifier(operand)) {
        const refName = operand.text;
        const refVar = this.graph.variables.get(refName);
        if (refVar?.isTainted) {
          this.addDataFlow(refName, targetName, 'assignment');
          return true;
        }
      }
      if (ts.isBinaryExpression(operand)) {
        if (this.checkBinaryExpressionForTaint(operand, targetName)) {
          return true;
        }
      }
    }
    return false;
  }

  private processCallExpression(node: ts.CallExpression): void {
    if (this.reactAnalyzer.isRoutingSink(node)) {
      const pos = this.getLineAndChar(node);
      const sink: TaintSink = {
        type: 'navigate',
        identifier: 'navigate',
        fileName: this.fileName,
        line: pos.line,
        column: pos.character
      };
      this.graph.taintSinks.push(sink);
    }

    if (this.reactAnalyzer.isLocalStorageSetItem(node)) {
      const pos = this.getLineAndChar(node);
      const sink: TaintSink = {
        type: 'localStorage.setItem',
        identifier: 'localStorage.setItem',
        fileName: this.fileName,
        line: pos.line,
        column: pos.character
      };
      this.graph.taintSinks.push(sink);
    }

    const hookName = this.reactAnalyzer.isHookCall(node);
    if (hookName && this.currentComponent) {
      if (!this.currentComponent.hooks.includes(hookName)) {
        this.currentComponent.hooks.push(hookName);
      }
    }

    const stateSetter = this.reactAnalyzer.isStateSetter(node);
    if (stateSetter && node.arguments.length > 0) {
      const arg = node.arguments[0];
      const argName = this.extractIdentifierName(arg);

      if (this.reactAnalyzer.isDomEventValueAccess(arg)) {
        const stateVarName = stateSetter.replace('set', '');
        const lowerStateVarName = stateVarName.charAt(0).toLowerCase() + stateVarName.slice(1);

        const stateVar = this.graph.variables.get(lowerStateVarName);
        if (stateVar) {
          stateVar.isTainted = true;
          stateVar.sourceNode = 'dom-event';
          if (stateVar.dataFlowSources.indexOf('dom-event') === -1) {
            stateVar.dataFlowSources.push('dom-event');
          }
        }

        const pos = this.getLineAndChar(node);
        const source: TaintSource = {
          type: 'user-input',
          identifier: lowerStateVarName,
          fileName: this.fileName,
          line: pos.line,
          column: pos.character
        };
        this.graph.taintSources.push(source);

        if (this.currentComponent && !this.currentComponent.taintSources.includes(lowerStateVarName)) {
          this.currentComponent.taintSources.push(lowerStateVarName);
        }
      } else if (argName) {
        this.addDataFlow(argName, stateSetter, 'state-update');

        const stateVarName = stateSetter.replace('set', '');
        const lowerStateVarName = stateVarName.charAt(0).toLowerCase() + stateVarName.slice(1);

        const stateVar = this.graph.variables.get(lowerStateVarName);
        if (stateVar) {
          const argVar = this.graph.variables.get(argName);
          if (argVar?.isTainted) {
            stateVar.isTainted = true;
            stateVar.sourceNode = argName;
            if (stateVar.dataFlowSources.indexOf(argName) === -1) {
              stateVar.dataFlowSources.push(argName);
            }
          }
        }
      }
    }
  }

  private processBinaryExpression(node: ts.BinaryExpression): void {
    if (node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const leftName = this.extractIdentifierName(node.left);
      const rightName = this.extractIdentifierName(node.right);

      if (leftName && rightName) {
        this.addDataFlow(rightName, leftName, 'assignment');
      }
    }
  }

  private addDataFlow(source: string, target: string, edgeType: DataFlowEdge['edgeType']): void {
    const edge: DataFlowEdge = {
      source,
      target,
      edgeType,
      fileName: this.fileName
    };
    this.graph.dataFlow.push(edge);

    if (this.graph.variables.has(source)) {
      const sourceNode = this.graph.variables.get(source);
      if (sourceNode?.isTainted) {
        this.propagateTaint(source, target);
      }
    }
  }

  private propagateTaint(sourceName: string, targetName: string): void {
    const targetVar = this.graph.variables.get(targetName);
    if (targetVar) {
      targetVar.isTainted = true;
      targetVar.sourceNode = sourceName;
      
      if (targetVar.dataFlowSources.indexOf(sourceName) === -1) {
        targetVar.dataFlowSources.push(sourceName);
      }
    }
  }

  private extractIdentifierName(node: ts.Node): string | null {
    if (ts.isIdentifier(node)) {
      return node.text;
    }
    return null;
  }
}
