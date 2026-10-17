import ts from 'typescript';

/** Imports reachable from module evaluation are initial, including boot-called local functions. */
export function initialImports(code) {
  const root = ts.createSourceFile('bundle.js', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (root.parseDiagnostics.length) throw new Error('invalid JavaScript');
  const host = ts.createCompilerHost({allowJs: true, noLib: true, noResolve: true});
  host.getSourceFile = name => name === 'bundle.js' ? root : undefined;
  const program = ts.createProgram(['bundle.js'], {allowJs: true, noLib: true, noResolve: true}, host);
  const checker = program.getTypeChecker();
  const symbol = node => {
    const value = node && checker.getSymbolAtLocation(node);
    return value?.valueDeclaration ?? value?.declarations?.[0] ?? value;
  };
  const bindings = new Map();
  const functions = new Set();
  const invokedBindings = new Set();
  const work = [[root, false]];
  const bind = (node, value) => {
    const name = symbol(node);
    if (!name || !value) return;
    const values = bindings.get(name) ?? [];
    if (values.includes(value)) return;
    values.push(value);
    bindings.set(name, values);
    if (invokedBindings.has(name)) work.push([value, true]);
  };
  const collect = node => {
    if (ts.isFunctionLike(node)) {
      functions.add(node);
      bind(node.name, node);
    }
    if (ts.isConstructorDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) work.push([node, true]);
    if (ts.isVariableDeclaration(node) || ts.isPropertyAssignment(node) || ts.isParameter(node)) bind(node.name, node.initializer);
    if (node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) work.push([node, true]);
    if (ts.isExportAssignment(node)) work.push([node.expression, true]);
    if (ts.isExportSpecifier(node)) {
      const exported = checker.getExportSpecifierLocalTargetSymbol(node);
      for (const declaration of exported?.declarations ?? []) work.push([declaration, true]);
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) bind(node.left, node.right);
    ts.forEachChild(node, collect);
  };
  collect(root);
  const imports = new Set();
  const invoked = new Set();
  const walked = new Set();
  while (work.length) {
    const [node, invoke] = work.pop();
    if (!node) continue;
    const seen = invoke ? invoked : walked;
    if (seen.has(node)) continue;
    seen.add(node);
    if (invoke) {
      if (functions.has(node)) {
        for (const param of node.parameters) work.push([param.initializer, false]);
        work.push([node.body, false]);
      } else if (ts.isIdentifier(node) || ts.isPropertyAccessExpression(node)) {
        const name = symbol(ts.isIdentifier(node) ? node : node.name);
        invokedBindings.add(name);
        for (const value of bindings.get(name) ?? []) work.push([value, true]);
      } else ts.forEachChild(node, child => {work.push([child, true]);});
      continue;
    }
    if (functions.has(node)) continue;
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) imports.add(node.getStart(root));
      else {
        work.push([node.expression, true]);
        const callee = ts.isIdentifier(node.expression) ? node.expression : ts.isPropertyAccessExpression(node.expression) ? node.expression.name : null;
        const local = bindings.get(symbol(callee))?.filter(value => functions.has(value)) ?? [];
        if (local.length) {
          for (const fn of local) fn.parameters.forEach((param, index) => bind(param.name, node.arguments?.[index]));
        } else {
          const event = node.arguments?.[0];
          const receiver = ts.isPropertyAccessExpression(node.expression) ? node.expression.expression : null;
          const nativeEvent = ts.isIdentifier(node.expression) ? !symbol(node.expression) : receiver && ts.isIdentifier(receiver) && /^(window|document)$/.test(receiver.text) && !symbol(receiver);
          const userEvent = nativeEvent && callee?.text === 'addEventListener' && event && ts.isStringLiteralLike(event) && /^(click|keydown|keyup|pointerdown|pointerup|submit|input|change)$/.test(event.text);
          // Event listeners run on user input; unknown callees may run callbacks immediately.
          if (!userEvent) for (const arg of node.arguments ?? []) work.push([arg, true]);
        }
      }
    }
    ts.forEachChild(node, child => {work.push([child, false]);});
  }
  return imports;
}
