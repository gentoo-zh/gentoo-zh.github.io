// Count each script in the import closure once, in Brotli bytes; enforce registered ownership.
// Two budgets per page: the startup closure (module scripts, modulepreloads and their static imports,
// which the browser requests before the load event) and the total, idle imports included. User-triggered
// imports use ON_DEMAND instead. scripts/check-runtime measures the same pages in a browser.
import {existsSync, readFileSync} from 'node:fs';
import {basename} from 'node:path';
import {brotliCompressSync} from 'node:zlib';
import {init, parse} from 'es-module-lexer';
import {fileFor, listFiles, report} from './lib/html.mjs';
import {ON_DEMAND, budgetFor} from './lib/budgets.mjs';
import {SCRIPT_OWNERS} from './lib/ui-rules.mjs';
import {scriptDigest} from './lib/script-provenance.mjs';
import {initialImports} from './lib/import-timing.mjs';
import {htmlElements, redirectAnchors} from './lib/html-elements.mjs';
import {ISLAND_ATTRIBUTE} from '../src/ui/islands/kinds.ts';

const DIST = 'dist';
const INLINE_OWNERS = new Set(SCRIPT_OWNERS.map(({source}) => source));
const MODULE_OWNERS = new Map(SCRIPT_OWNERS.flatMap(({source, modules}) => modules.map(name => [name, source])));
/** Owners whose dynamic import() targets load on a user action, booked under ON_DEMAND. */
const ON_DEMAND_OWNERS = new Set(SCRIPT_OWNERS.filter(({onDemand}) => onDemand === true).map(({source}) => source));

const failures = [];
const provenancePath = `${DIST}/script-provenance.json`;
const provenance = existsSync(provenancePath) ? JSON.parse(readFileSync(provenancePath, 'utf8')) : {};
if (!existsSync(provenancePath)) failures.push('missing build script provenance');

function moduleOwner(url, code) {
  // Pagefind is generated after the Astro bundle; only its fixed public entry is registered.
  if (url === '/pagefind/pagefind.js') return MODULE_OWNERS.get('pagefind');
  const owner = MODULE_OWNERS.get(moduleName(url));
  const entry = provenance[url];
  return owner && entry?.digest === scriptDigest(code) && entry.modules.length > 0 &&
    entry.modules.every(module => module.owners.some(source => INLINE_OWNERS.has(source))) &&
    entry.modules.some(module => module.owners.includes(owner)) ? owner : undefined;
}

for (const source of INLINE_OWNERS) {
  if (!existsSync(source)) failures.push(`registry: owner ${source} does not exist`);
}
for (const path of listFiles('src').map(url => `src${url}`)) {
  for (const [, owner] of readFileSync(path, 'utf8').matchAll(/data-owner="([^"]+)"/g)) {
    if (owner !== path) failures.push(`${path}: claims data-owner="${owner}", which is not this file`);
  }
}

/** `name.Hash1234.js` → `name`: the bundle name Astro derives from the source module. */
const moduleName = url => basename(url).replace(/(?:\.[\w-]{8})?\.m?js$/, '');

/** Track imports and ownership; a static path to a module overrides its on-demand classification. */
function follow(url, page, scripts, onDemand = false) {
  const seen = scripts.get(url);
  if (seen != null && (onDemand || !seen.onDemand)) return;
  if (seen != null) {
    seen.onDemand = false;
    followImports(seen.code, url, page, scripts, false);
    return;
  }
  const file = fileFor(DIST, url);
  if (!existsSync(file)) {
    failures.push(`${page}: script ${url} is not in dist`);
    return;
  }
  const code = readFileSync(file, 'utf8');
  scripts.set(url, {code, onDemand});
  if (!moduleOwner(url, code)) failures.push(`${page}: script ${url} has no registered owner`);
  followImports(code, url, page, scripts, onDemand);
}

/** Follow literal imports; reject unresolved dynamic specifiers because their cost is unknown. */
const importCache = new Map();
function followImports(code, base, page, scripts, onDemand = false) {
  let imports;
  let initial;
  try {
    if (!importCache.has(code)) importCache.set(code, {imports: parse(code)[0], initial: initialImports(code)});
    ({imports, initial} = importCache.get(code));
  } catch (error) {
    failures.push(`${page}: ${base} does not parse as JavaScript (${error.message})`);
    return;
  }
  for (const record of imports) {
    if (record.type === 'import-meta') continue;
    const {specifier} = record;
    if (specifier == null || (record.type === 'dynamic' && record.glob)) {
      failures.push(`${page}: ${base} has an import() whose target is not a fixed string`);
      continue;
    }
    if (!/^\.{0,2}\//.test(specifier)) {
      failures.push(`${page}: ${base} imports bare specifier ${specifier}`);
      continue;
    }
    const target = new URL(specifier, `https://dist${base}`).pathname;
    const targetFile = fileFor(DIST, target);
    const owner = existsSync(targetFile) ? moduleOwner(target, readFileSync(targetFile, 'utf8')) : undefined;
    const lazy = record.type === 'dynamic' && !initial.has(record.importStart) && ON_DEMAND_OWNERS.has(owner);
    follow(target, page, scripts, onDemand || lazy);
  }
}

/** Same-origin targets of a script's static imports, which load with it before any dynamic import. */
function staticImports(code, base) {
  if (!importCache.has(code)) return [];
  return importCache.get(code).imports.filter(({type, specifier}) => type === 'static' && specifier != null && /^\.{0,2}\//.test(specifier)).map(({specifier}) => new URL(specifier, `https://dist${base}`).pathname);
}

/** The page's startup closure: `roots` and everything they import statically. */
function startupClosure(roots, scripts) {
  const closure = new Set();
  const visit = url => {
    if (closure.has(url) || !scripts.has(url)) return;
    closure.add(url);
    for (const target of staticImports(scripts.get(url).code, url)) visit(target);
  };
  for (const url of roots) visit(url);
  return closure;
}

// The same shared chunks occur on hundreds of static contributor profiles.
const compressedSizes = new Map();
function compressedSize(code) {
  if (!compressedSizes.has(code)) compressedSizes.set(code, brotliCompressSync(code).length);
  return compressedSizes.get(code);
}

/** Controls are interactive only inside a root whose authenticated entry was loaded. */
function outsideToggles(elements, scripts) {
  const handlers = {section: 'SectionNavScript.astro_astro_type_script_index_0_lang', nav: 'NavScript.astro_astro_type_script_index_0_lang', contributors: 'ContributorsScript.astro_astro_type_script_index_0_lang', guide: 'GuideSetupScript.astro_astro_type_script_index_0_lang', costs: 'CostsSummaryScript.astro_astro_type_script_index_0_lang'};
  const entries = new Set([...scripts].filter(([url, {code}]) => moduleOwner(url, code)).map(([url]) => moduleName(url)));
  return elements.filter(element => {
    if (!element.attrs.has('aria-expanded')) return false;
    for (let parent = element; parent; parent = parent.parent) {
      if (parent.name === 'div' && entries.has(handlers[parent.attrs.get(ISLAND_ATTRIBUTE)])) return false;
    }
    return true;
  }).length;
}

await init;
let largest = {page: '', bytes: 0};
let largestStartup = {page: '', bytes: 0};
let largestLazy = {page: '', bytes: 0};
for (const url of listFiles(DIST).filter(url => url.endsWith('.html'))) {
  const page = url.replace(/index\.html$/, '');
  const html = readFileSync(fileFor(DIST, url), 'utf8');
  const scripts = new Map();
  /** Scripts the page itself requests: module scripts, modulepreloads and inline modules' static imports. */
  const roots = [];
  const elements = htmlElements(html);
  for (const {name, attrs, content: inline} of elements) {
    if (name === 'link' && attrs.get('rel')?.toLowerCase().split(/\s+/).includes('modulepreload') && attrs.has('href')) {
      roots.push(new URL(attrs.get('href'), `https://dist${page}`).pathname);
      follow(roots.at(-1), page, scripts);
    }
    if (name !== 'script') continue;
    if (attrs.get('type') === 'application/ld+json') {
      try { JSON.parse(inline); } catch { failures.push(`${page}: invalid JSON-LD`); }
      continue;
    }
    const src = attrs.get('src');
    if (src != null) {
      roots.push(new URL(src, `https://dist${page}`).pathname);
      follow(roots.at(-1), page, scripts);
      continue;
    }
    const owner = attrs.get('data-owner');
    if (!INLINE_OWNERS.has(owner)) failures.push(`${page}: inline script ${owner == null ? 'without data-owner' : `owned by ${owner}`} is not registered`);
    scripts.set(`inline:${inline}`, {code: inline, onDemand: false});
    followImports(inline, page, page, scripts);
    roots.push(...staticImports(inline, page));
  }
  const size = lazy => [...scripts.values()].filter(({onDemand}) => onDemand === lazy).reduce((sum, {code}) => sum + compressedSize(code), 0);
  const bytes = size(false);
  const lazyBytes = size(true);
  const startupBytes = [...startupClosure(roots, scripts)].reduce((sum, url) => sum + compressedSize(scripts.get(url).code), 0);
  const budget = budgetFor(page, html, redirectAnchors(html));
  if (startupBytes > budget.startup) failures.push(`${page}: startup closure ${startupBytes} B (brotli) exceeds ${budget.startup} B`);
  if (bytes > budget.total) failures.push(`${page}: ${bytes} B of script in total (brotli) exceeds ${budget.total} B`);
  if (startupBytes > largestStartup.bytes) largestStartup = {page, bytes: startupBytes};
  if (lazyBytes > ON_DEMAND) failures.push(`${page}: ${lazyBytes} B of on-demand script (brotli) exceeds ${ON_DEMAND} B`);
  if (bytes > largest.bytes) largest = {page, bytes};
  if (lazyBytes > largestLazy.bytes) largestLazy = {page, bytes: lazyBytes};
  const toggles = outsideToggles(elements, scripts);
  if (toggles > 0) failures.push(`${page}: ${toggles} aria-expanded control(s), outside hydrated roots with a registered handler`);
}

if (failures.length === 0) console.log(`check:budget: largest startup closure ${largestStartup.page || 'none'} ${largestStartup.bytes} B; total ${largest.page || 'none'} ${largest.bytes} B; on demand ${largestLazy.page || 'none'} ${largestLazy.bytes} B`);
report('check:budget', failures);
