import * as ts from 'typescript';

export class ReactAnalyzer {
  private knownHooks = new Set([
    'useState',
    'useEffect',
    'useContext',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useSearchParams',
    'useNavigate',
    'useParams',
    'useLocation',
    'useHistory'
  ]);

  isReactComponent(node: ts.Node): boolean {
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      return this.hasReactPattern(node);
    }
    return false;
  }

  isHookCall(node: ts.Node): string | null {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const hookName = node.expression.text;
      if (this.knownHooks.has(hookName)) {
        return hookName;
      }
    }
    return null;
  }

  isStateSetter(node: ts.Node): string | null {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const funcName = node.expression.text;
      if (funcName.startsWith('set') && funcName.length > 3) {
        return funcName;
      }
    }
    return null;
  }

  isTaintSource(node: ts.CallExpression): boolean {
    if (ts.isPropertyAccessExpression(node.expression)) {
      const property = node.expression.name;
      if (property.text === 'get' && this.isSearchParamsObject(node.expression.expression)) {
        return true;
      }
    }
    return false;
  }

  isDomEventValueAccess(node: ts.Node): boolean {
    if (!ts.isPropertyAccessExpression(node)) return false;
    if (node.name.text !== 'value') return false;

    const target = node.expression;
    if (!ts.isPropertyAccessExpression(target)) return false;
    if (target.name.text !== 'target' && target.name.text !== 'currentTarget') return false;

    return true;
  }

  isSearchParamsObject(node: ts.Node): boolean {
    if (ts.isIdentifier(node)) {
      return node.text === 'searchParams';
    }
    return false;
  }

  isRoutingSink(node: ts.CallExpression): boolean {
    if (ts.isIdentifier(node.expression)) {
      return node.expression.text === 'navigate';
    }
    return false;
  }

  isLocalStorageSetItem(node: ts.CallExpression): boolean {
    if (ts.isPropertyAccessExpression(node.expression)) {
      const object = node.expression.expression;
      const property = node.expression.name;
      
      if (property.text === 'setItem' && ts.isIdentifier(object)) {
        return object.text === 'localStorage';
      }
    }
    return false;
  }

  isStateVariableDeclaration(node: ts.VariableDeclaration): boolean {
    if (ts.isArrayBindingPattern(node.name)) {
      return true;
    }
    return false;
  }

  extractComponentName(node: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction): string | null {
    if (ts.isFunctionDeclaration(node) && node.name) {
      return node.name.text;
    }
    
    if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
      return node.parent.name.text;
    }
    
    return null;
  }

  hasReactPattern(node: ts.Node): boolean {
    const sourceFile = node.getSourceFile();
    const text = sourceFile.getText();
    
    if (text.includes('useState') || text.includes('useEffect') || text.includes('useNavigate')) {
      return true;
    }
    
    if (ts.isFunctionDeclaration(node) && node.body) {
      return this.hasJSX(node.body);
    }
    
    if (ts.isArrowFunction(node) && node.body) {
      return this.hasJSX(node.body);
    }
    
    return false;
  }

  hasJSX(node: ts.Node): boolean {
    let hasJsx = false;
    
    function visit(child: ts.Node) {
      if (hasJsx) return;
      
      if (ts.isJsxElement(child) || ts.isJsxFragment(child) || ts.isJsxSelfClosingElement(child)) {
        hasJsx = true;
        return;
      }
      
      ts.forEachChild(child, visit);
    }
    
    visit(node);
    return hasJsx;
  }

  extractVariableName(node: ts.Node): string | null {
    if (ts.isIdentifier(node)) {
      return node.text;
    }
    if (ts.isBindingName(node) && ts.isArrayBindingPattern(node)) {
      if (node.elements.length > 0 && ts.isBindingElement(node.elements[0])) {
        const element = node.elements[0];
        if (ts.isIdentifier(element.name)) {
          return element.name.text;
        }
      }
    }
    return null;
  }

  extractStringLiteral(node: ts.Node): string | null {
    if (ts.isStringLiteral(node)) {
      return node.text;
    }
    return null;
  }
}
