// Count each script in the import closure once, in Brotli bytes; enforce registered ownership.
// User-triggered imports use ON_DEMAND; idle and initial imports count toward the page budget.
import {existsSync, readFileSync} from 'node:fs';
import {basename} from 'node:path';
import {brotliCompressSync} from 'node:zlib';
import {init, parse} from 'es-module-lexer';
import {fileFor, listFiles, report} from './lib/html.mjs';
import {BUDGETS, CHROME, ON_DEMAND, FRAGMENT_REDIRECT, isRedirect} from './lib/budgets.mjs';
import {SCRIPT_OWNERS} from './lib/ui-rules.mjs';
import {scriptDigest} from './lib/script-provenance.mjs';
import {initialImports} from './lib/import-timing.mjs';
import {htmlElements, redirectAnchors} from './lib/html-elements.mjs';

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
      if (parent.name === 'div' && entries.has(handlers[parent.attrs.get('data-gz-island')])) return false;
    }
    return true;
  }).length;
}

await init;
let largest = {page: '', bytes: 0};
let largestLazy = {page: '', bytes: 0};
for (const url of listFiles(DIST).filter(url => url.endsWith('.html'))) {
  const page = url.replace(/index\.html$/, '');
  const html = readFileSync(fileFor(DIST, url), 'utf8');
  const scripts = new Map();
  const elements = htmlElements(html);
  for (const {name, attrs, content: inline} of elements) {
    if (name === 'link' && attrs.get('rel')?.toLowerCase().split(/\s+/).includes('modulepreload') && attrs.has('href')) {
      follow(new URL(attrs.get('href'), `https://dist${page}`).pathname, page, scripts);
    }
    if (name !== 'script') continue;
    if (attrs.get('type') === 'application/ld+json') {
      try { JSON.parse(inline); } catch { failures.push(`${page}: invalid JSON-LD`); }
      continue;
    }
    const src = attrs.get('src');
    if (src != null) {
      follow(new URL(src, `https://dist${page}`).pathname, page, scripts);
      continue;
    }
    const owner = attrs.get('data-owner');
    if (!INLINE_OWNERS.has(owner)) failures.push(`${page}: inline script ${owner == null ? 'without data-owner' : `owned by ${owner}`} is not registered`);
    scripts.set(`inline:${inline}`, {code: inline, onDemand: false});
    followImports(inline, page, page, scripts);
  }
  const size = lazy => [...scripts.values()].filter(({onDemand}) => onDemand === lazy).reduce((sum, {code}) => sum + compressedSize(code), 0);
  const bytes = size(false);
  const lazyBytes = size(true);
  const budget = isRedirect(html) ? (redirectAnchors(html) ? FRAGMENT_REDIRECT : 0) : CHROME + BUDGETS.find(({route}) => route.test(page)).extra;
  if (bytes > budget) failures.push(`${page}: ${bytes} B of script (brotli) exceeds ${budget} B`);
  if (lazyBytes > ON_DEMAND) failures.push(`${page}: ${lazyBytes} B of on-demand script (brotli) exceeds ${ON_DEMAND} B`);
  if (bytes > largest.bytes) largest = {page, bytes};
  if (lazyBytes > largestLazy.bytes) largestLazy = {page, bytes: lazyBytes};
  const toggles = outsideToggles(elements, scripts);
  if (toggles > 0) failures.push(`${page}: ${toggles} aria-expanded control(s), outside hydrated roots with a registered handler`);
}

if (failures.length === 0) console.log(`check:budget: largest ${largest.page || 'none'} ${largest.bytes} B; on demand ${largestLazy.page || 'none'} ${largestLazy.bytes} B`);
report('check:budget', failures);
