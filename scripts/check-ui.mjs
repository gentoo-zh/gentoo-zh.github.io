// Check stylesheets, Astro templates and content callouts beyond ESLint's TypeScript coverage.
import {readFileSync} from 'node:fs';
import {parse} from '@astrojs/compiler-rs';
import {listFiles, report} from './lib/html.mjs';
import {BANNED_IMPORTS, SCRIPT_OWNERS, UPSTREAM_CSS_MODULES, VISIBLE_PROPS} from './lib/ui-rules.mjs';

const THEME_OUTPUT = 'src/theme/built/gentoo.css';
const CALLOUT_TYPES = new Set(['info', 'warning', 'error']);
const RAW_VALUE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(|\b\d+(?:\.\d+)?px\b/;
const TEXT = /\p{L}/u;

/** .astro files allowed a document skeleton; only Base.astro loads stylesheets. */
const LAYOUTS = {
  'src/layouts/Base.astro': {stylesheets: true},
  'src/layouts/Redirect.astro': {stylesheets: false},
  'src/layouts/SectionLayout.astro': {stylesheets: false},
};
const SKELETON = new Set(['html', 'head', 'body', 'meta', 'title', 'link', 'slot']);
const SCRIPT_SOURCES = new Set(SCRIPT_OWNERS.map(({source}) => source));

const failures = [];
const sources = listFiles('src').map(url => `src${url}`);

for (const path of sources.filter(path => path.endsWith('.css') && path !== THEME_OUTPUT)) {
  if (!UPSTREAM_CSS_MODULES.includes(path)) {
    failures.push(`${path}: hand-written CSS; style through Astryx props, StyleX with tokens, or a registered upstream CSS module`);
    continue;
  }
  // Copied modules still take colours and sizes from tokens only.
  readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .forEach((line, index) => {
      if (RAW_VALUE.test(line)) failures.push(`${path}:${index + 1}: raw colour or size; use a token`);
    });
}

function elementName(node) {
  const name = node.openingElement?.name;
  return name?.type === 'JSXIdentifier' ? name.name : name?.type === 'JSXNamespacedName' ? `${name.namespace.name}:${name.name.name}` : null;
}

function* walk(node, parent = null) {
  if (Array.isArray(node)) {
    for (const child of node) yield* walk(child, parent);
    return;
  }
  if (node == null || typeof node !== 'object') return;
  if (typeof node.type === 'string') yield [node, parent];
  for (const [key, value] of Object.entries(node)) {
    if (key !== 'type' && typeof value === 'object') yield* walk(value, typeof node.type === 'string' ? node : parent);
  }
}

/** String pieces of an attribute value that a reader would see; catalog keys and call arguments are data. */
function* shownStrings(node) {
  if (node == null || typeof node !== 'object') return;
  if (node.type === 'Literal' && typeof node.value === 'string') yield node.value;
  else if (node.type === 'TemplateElement') yield node.value.raw;
  else if (node.type === 'JSXText') yield node.value;
  else if (node.type === 'MemberExpression') yield* shownStrings(node.object);
  else if (node.type === 'CallExpression') yield* shownStrings(node.callee);
  else for (const value of Object.values(node)) if (typeof value === 'object') yield* shownStrings(value);
}

function checkAstro(path) {
  const layout = LAYOUTS[path];
  const isScriptOwner = SCRIPT_SOURCES.has(path);
  if (layout == null && !isScriptOwner && !path.startsWith('src/pages/')) {
    return [`unregistered .astro file; register it as a layout or script owner in scripts/check-ui.mjs`];
  }
  const allowed = layout != null ? new Set([...SKELETON, ...(isScriptOwner ? ['script'] : [])]) : isScriptOwner ? new Set(['script']) : new Set();
  const {ast, diagnostics} = parse(readFileSync(path, 'utf8'));
  const problems = diagnostics.filter(({severity}) => severity === 'error').map(({message}) => `parse error: ${message}`);

  for (const [node, parent] of walk([ast.frontmatter, ast.body])) {
    switch (node.type) {
      case 'ImportDeclaration':
      case 'ImportExpression':
      case 'ExportAllDeclaration':
      case 'ExportNamedDeclaration': {
        const specifier = node.source?.value;
        if (typeof specifier !== 'string') break;
        for (const {test, message} of BANNED_IMPORTS) {
          if (test(specifier) && !(layout?.stylesheets && specifier.endsWith('.css'))) problems.push(`import ${specifier}: ${message}`);
        }
        break;
      }
      case 'CallExpression': {
        const callee = node.callee.type === 'MemberExpression' ? node.callee.property.name : node.callee.name;
        if (callee === 'createElement' && ['Literal', 'TemplateLiteral'].includes(node.arguments[0]?.type)) {
          problems.push('createElement with a tag name; pass a component');
        }
        break;
      }
      case 'AstroDoctype':
        if (layout == null) problems.push('document skeleton outside a registered layout');
        break;
      case 'JSXElement': {
        const name = elementName(node);
        if (name != null && /^[a-z]/.test(name) && !allowed.has(name)) problems.push(`native <${name}>; compose Astryx through a React component`);
        break;
      }
      case 'JSXText':
        if (TEXT.test(node.value)) problems.push(`text "${node.value.trim().slice(0, 40)}" outside the i18n catalogs`);
        break;
      case 'JSXExpressionContainer':
        if (layout != null && isScriptOwner && parent?.type === 'JSXElement' && elementName(parent) === 'head' &&
          node.expression.type === 'LogicalExpression' && node.expression.operator === '&&' &&
          elementName(node.expression.right) === 'script') break;
        // Content position: the template root (no parent), an element, or a fragment; an
        // attribute value is checked under JSXAttribute.
        if (parent == null || parent.type === 'JSXFragment') {
          problems.push(`{…} ${parent == null ? 'at the template root' : 'inside <>…</>'}; render content through a React component`);
        } else if (parent.type === 'JSXElement' && !(layout != null && elementName(parent) === 'title')) {
          problems.push(`{…} child of <${elementName(parent)}>; render content through a React component`);
        }
        break;
      case 'JSXAttribute': {
        const name = node.name.type === 'JSXNamespacedName' ? `${node.name.namespace.name}:${node.name.name.name}` : node.name.name;
        if (/^(class|className|class:list|style)$/.test(name)) problems.push(`${name}= styling in a template`);
        if (/^set:/.test(name) && layout == null) problems.push(`${name} outside a registered layout`);
        if (/^(is:inline|define:vars)$/.test(name) && !isScriptOwner) problems.push(`${name} outside a registered script owner`);
        if (VISIBLE_PROPS.includes(name) && [...shownStrings(node.value)].some(text => TEXT.test(text))) {
          problems.push(`${name}= text outside the i18n catalogs`);
        }
        break;
      }
      case 'Literal':
        if (typeof node.value === 'string' && RAW_VALUE.test(node.value)) problems.push(`raw colour or size "${node.value}"`);
        break;
      case 'TemplateElement':
        if (RAW_VALUE.test(node.value.raw)) problems.push(`raw colour or size "${node.value.raw}"`);
        break;
    }
  }
  return problems;
}

for (const path of sources.filter(path => path.endsWith('.astro'))) {
  for (const problem of checkAstro(path)) failures.push(`${path}: ${problem}`);
}

for (const path of listFiles('content').filter(url => url.endsWith('.md')).map(url => `content${url}`)) {
  for (const [, attrs] of readFileSync(path, 'utf8').matchAll(/\{\{<\s*callout\b([^>]*)>\}\}/g)) {
    const type = /type="([^"]*)"/.exec(attrs)?.[1];
    if (!CALLOUT_TYPES.has(type)) failures.push(`${path}: callout type "${type ?? '(none)'}" is not info, warning or error`);
  }
}

report('check:ui', failures);
