// AST gates for I3 (UI only from Astryx), I4 (no raw visual values, one spacing and size scale)
// and the literal half of I5.
// .astro files get the same rules from scripts/check-ui.mjs, which shares the lists below.
import tseslint from 'typescript-eslint';
import {resolve, dirname} from 'node:path';
import {HTML_INJECTION, NATIVE_ELEMENTS, UPSTREAM_CSS_MODULES, VISIBLE_PROPS} from './scripts/lib/ui-rules.mjs';

const RAW_VALUE = String.raw`/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(|\b\d+(?:\.\d+)?px\b/`;
const TEXT = String.raw`/\p{L}/u`;
const NATIVE = `/^(${NATIVE_ELEMENTS.join('|')})$/`;
const VISIBLE = `/^(${VISIBLE_PROPS.join('|')})$/`;
const TEXT_MESSAGE = 'Visible text comes from the i18n catalogs or a named constant in src/site.ts.';

/** Banned in every layer: stylesheets other than Base.astro's and the copied upstream CSS modules. */
const SHARED_IMPORTS = {
  paths: [],
  patterns: [
    {
      group: ['*.css', ...UPSTREAM_CSS_MODULES.map(path => `!**/${path.split('/').pop()}`)],
      message: 'Only Base.astro loads stylesheets; components import the registered upstream CSS modules only.',
    },
  ],
};

/** Spacing and control-size props take their value from src/theme/scale.ts, never a literal. */
const SCALE_PROPS = '/^(gap|rowGap|columnGap|padding|paddingInline|paddingBlock|paddingBlockStart|paddingBlockEnd|paddingInlineStart|paddingInlineEnd|size)$/';
/** The same keys inside a spread object literal, plus a grid's minWidth. */
const SCALE_SPREAD_KEYS = SCALE_PROPS.replace(')$/', '|minWidth)$/');
const SCALE_OBJECTS = '/^(SPACE|BUTTON|ICON|AVATAR|CHIP|GRID|CARD|STACK|CODE|TEMPLATE|TAB)$/';
const SCALE_MESSAGE = 'Spacing and sizes come from src/theme/scale.ts (SPACE, BUTTON, ICON, AVATAR, CHIP, GRID, CARD, STACK, CODE, TEMPLATE, TAB).';

const LAYERS = {
  // Lower layers never reach up into the page composition.
  'src/i18n/**': ['**/ui/**', '**/markdown/**', '**/content/**'],
  'src/content/**': ['**/ui/**', '**/markdown/**'],
  'src/markdown/**': ['**/ui/**', '**/content/**'],
  'src/data/**': ['**/ui/**', '**/markdown/**', '**/content/**', '**/i18n/**'],
};

/**
 * Strings a reader would see: string and template literals at any depth inside a visible
 * expression (`{…}` content of an element or fragment, or a visible prop's value), through
 * `?:`, `&&`, `??`, `+` and nested branches alike. Excluded are strings that are data, not
 * content: arguments of calls such as `t('gz.key')` (a callback's body is still content),
 * computed member and object keys, comparison operands, and attributes of nested elements
 * that a reader does not see (a nested visible prop is checked on its own).
 */
const DATA_POSITION = [
  'CallExpression > Literal.arguments',
  'CallExpression > :not(ArrowFunctionExpression, FunctionExpression).arguments *',
  'MemberExpression > Literal.property',
  'Property > Literal.key',
  'BinaryExpression[operator=/^(?:[=!]==?|in|instanceof)$/] > Literal',
  `JSXAttribute:not([name.name=${VISIBLE}]) *`,
].join(', ');
const shownValue = parent => [
  `${parent} Literal[value=${TEXT}]:not(${DATA_POSITION})`,
  `${parent} TemplateElement[value.raw=${TEXT}]:not(${DATA_POSITION})`,
];

const RESTRICTED = [
        {
          selector: `JSXOpeningElement[name.type="JSXIdentifier"][name.name=/^[a-z]/][name.name!=${NATIVE}]`,
          message: 'Use the Astryx component, not a raw element (allowlist: scripts/lib/ui-rules.mjs).',
        },
        {selector: 'JSXOpeningElement[name.type="JSXNamespacedName"]', message: 'Use the Astryx component, not a raw element.'},
        {
          selector: `CallExpression:matches([callee.name="createElement"], [callee.property.name="createElement"]) > :matches(Literal, TemplateLiteral):first-child`,
          message: 'createElement takes a component, not a tag name.',
        },
        {
          selector: 'JSXOpeningElement[name.name=/^[a-z]/] > JSXAttribute[name.name=/^(style|className|class)$/]',
          message: 'Native elements style through {...stylex.props(...)} only.',
        },
        {selector: 'JSXAttribute[name.name="style"]', message: 'Style through props, StyleX and the theme.'},
        {
          selector:
            'JSXAttribute[name.name="className"]:not([value.expression.type="MemberExpression"][value.expression.object.name="css"]):not([value.expression.name="className"])',
          message: 'className only carries a class of a registered upstream CSS module (css.x).',
        },
        {
          selector: 'JSXOpeningElement[name.name="div"]:not(:has(JSXSpreadAttribute > CallExpression[callee.object.name="stylex"][callee.property.name="props"]))',
          message: 'A div is only a StyleX layout box: give it {...stylex.props(...)}, or use an Astryx Stack.',
        },
        {selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]', message: 'Only the navigation island mount injects HTML.'},
        {selector: `Literal[value=${RAW_VALUE}]`, message: 'Colours and sizes live in src/theme/gentoo.ts.'},
        {selector: `TemplateElement[value.raw=${RAW_VALUE}]`, message: 'Colours and sizes live in src/theme/gentoo.ts.'},
        {selector: `JSXText[value=${TEXT}]`, message: TEXT_MESSAGE},
        ...[
          ...shownValue(':matches(JSXElement, JSXFragment) > JSXExpressionContainer'),
          `JSXAttribute[name.name=${VISIBLE}] > Literal[value=${TEXT}]`,
          ...shownValue(`JSXAttribute[name.name=${VISIBLE}] > JSXExpressionContainer`),
        ].map(selector => ({selector, message: TEXT_MESSAGE})),
];

const scaleProps = new RegExp(SCALE_PROPS.slice(1, -1));
const scaleKeys = new RegExp(SCALE_SPREAD_KEYS.slice(1, -1));
const scaleObjects = new RegExp(SCALE_OBJECTS.slice(1, -1));
const scaleRule = {
  meta: {schema: [], messages: {scale: SCALE_MESSAGE}},
  create(context) {
    const variable = node => {
      for (let scope = context.sourceCode.getScope(node); scope; scope = scope.upper) {
        const found = scope.set.get(node.name);
        if (found) return found;
      }
    };
    const scaleObject = node => {
      if (node?.type !== 'Identifier') return false;
      const binding = variable(node);
      const definition = binding?.defs[0];
      return definition?.type === 'ImportBinding' && definition.node.type === 'ImportSpecifier' &&
        scaleObjects.test(definition.node.imported.name) &&
        resolve(dirname(context.filename), definition.parent.source.value).replace(/\.ts$/, '') === resolve('src/theme/scale');
    };
    const valid = (node, seen = new Set()) => {
      if (!node || seen.has(node)) return false;
      seen.add(node);
      if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression') return valid(node.expression, seen);
      if (node.type === 'MemberExpression') return scaleObject(node.object) &&
        (!node.computed || (node.property.type === 'Literal' && typeof node.property.value === 'string'));
      if (node.type === 'ConditionalExpression') return valid(node.consequent, new Set(seen)) && valid(node.alternate, new Set(seen));
      if (node.type !== 'Identifier') return false;
      const binding = variable(node);
      const definition = binding?.defs[0];
      return definition?.type === 'Variable' && definition.parent.kind === 'const' &&
        !binding.references.some(reference => reference.isWrite() && !reference.init) && valid(definition.node.init, seen);
    };
    const check = (node, value) => {if (!valid(value)) context.report({node, messageId: 'scale'});};
    return {
      JSXAttribute(node) {
        if (scaleProps.test(node.name.name)) check(node, node.value?.expression);
      },
      Property(node) {
        const key = node.key.name ?? node.key.value;
        if (!scaleKeys.test(key)) return;
        const ancestors = context.sourceCode.getAncestors(node);
        if (ancestors.some(parent => parent.type === 'JSXSpreadAttribute') ||
          (key === 'minWidth' && ancestors.some(parent => parent.type === 'JSXAttribute' && parent.name.name === 'columns'))) check(node, node.value);
      },
    };
  },
};

export default tseslint.config(
  {ignores: ['dist/', '.astro/', 'node_modules/', 'src/theme/']},
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {parser: tseslint.parser, parserOptions: {ecmaFeatures: {jsx: true}}},
    plugins: {site: {rules: {'scale-value': scaleRule}}},
    rules: {
      'site/scale-value': 'error',
      'no-restricted-imports': ['error', SHARED_IMPORTS],
      'no-restricted-syntax': ['error', ...RESTRICTED],
    },
  },
  {
    // The island mount is the one place that injects HTML: the island's own server render.
    files: HTML_INJECTION,
    rules: {
      'no-restricted-syntax': ['error', ...RESTRICTED.filter(({selector}) => !selector.includes('dangerouslySetInnerHTML'))],
    },
  },
  {
    files: ['src/ui/SiteHead.tsx'],
    rules: {
      'no-restricted-syntax': ['error', ...RESTRICTED.filter(({selector}) => !selector.includes('dangerouslySetInnerHTML')).map(rule => rule.selector.includes('JSXOpeningElement[name.type="JSXIdentifier"]') ? {...rule, selector: rule.selector.replace(NATIVE, `/^(${[...NATIVE_ELEMENTS, 'script'].join('|')})$/`)} : rule),
        {selector: 'JSXOpeningElement[name.name="script"]:not(:has(JSXAttribute[name.name="type"][value.value="application/ld+json"]))', message: 'SiteHead only emits JSON-LD data scripts.'}],
    },
  },
  ...Object.entries(LAYERS).map(([files, group]) => ({
    files: [files],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: SHARED_IMPORTS.paths,
          patterns: [...SHARED_IMPORTS.patterns, {group, message: 'Layer boundary: see docs/architecture.md.'}],
        },
      ],
    },
  })),
);
