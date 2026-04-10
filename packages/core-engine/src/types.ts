export interface ComponentNode {
  name: string;
  fileName: string;
  line: number;
  column: number;
  props: string[];
  hooks: string[];
  children: string[];
  taintSources: string[];
}

export interface VariableNode {
  name: string;
  fileName: string;
  line: number;
  column: number;
  isTainted: boolean;
  dataFlowSources: string[];
  isState: boolean;
  isProp: boolean;
  sourceNode?: string;
}

export interface DataFlowEdge {
  source: string;
  target: string;
  edgeType: 'assignment' | 'state-update' | 'prop-passing' | 'hook-output';
  fileName: string;
}

export interface TaintSource {
  type: 'url-param' | 'user-input' | 'api-response' | 'cookie' | 'local-storage';
  identifier: string;
  fileName: string;
  line: number;
  column: number;
}

export interface TaintSink {
  type: 'navigate' | 'localStorage.setItem' | 'document.cookie' | 'fetch';
  identifier: string;
  fileName: string;
  line: number;
  column: number;
}

export interface SensitiveDataPattern {
  keywords: string[];
  functionNames: string[];
  stringPatterns: RegExp[];
}

export interface ComponentGraph {
  components: Map<string, ComponentNode>;
  variables: Map<string, VariableNode>;
  dataFlow: DataFlowEdge[];
  taintSources: TaintSource[];
  taintSinks: TaintSink[];
}
