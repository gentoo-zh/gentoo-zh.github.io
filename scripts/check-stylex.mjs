// StyleX: every atomic class the built pages or bundles use has a rule in the shipped CSS. Rules
// compiled only in the client build used to be dropped silently, so island styles never applied.
// The shipped CSS is any standalone .css file plus the inline <style> blocks of the built HTML
// (build.inlineStylesheets: 'always' puts the whole stylesheet into every page).
import {readFileSync} from 'node:fs';
import {isRedirect} from './lib/budgets.mjs';
import {fileFor, listFiles, report} from './lib/html.mjs';

const DIST = 'dist';
/** StyleX atomic classes: this site's `p` prefix (astro.config.ts) and Astryx's default `x`. */
const ATOMIC = /^[px][a-z0-9]{5,9}$/;
const failures = [];

const files = listFiles(DIST);
const read = url => readFileSync(fileFor(DIST, url), 'utf8');
/** Class selectors in a stylesheet's text. */
const classesIn = css => [...css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map(match => match[1]);
const standalone = new Set();
for (const url of files) if (url.endsWith('.css')) for (const name of classesIn(read(url))) standalone.add(name);
/** Page URL → the classes its own inline <style> blocks define; `defined` is every class any stylesheet defines. */
const inline = new Map();
const defined = new Set(standalone);
let styleBlocks = 0;
for (const url of files.filter(url => url.endsWith('.html'))) {
  const names = new Set();
  for (const [, css] of read(url).matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
    styleBlocks++;
    for (const name of classesIn(css)) names.add(name);
  }
  inline.set(url, names);
  for (const name of names) defined.add(name);
}

/** Class name → the first file that uses it. */
const used = new Map();
const own = new Map();
const use = (text, url) => {
  for (const name of text.split(/\s+/)) if (ATOMIC.test(name) && !used.has(name)) used.set(name, url);
};
for (const url of files) {
  if (url.endsWith('.js')) {
    const code = read(url);
    // Compiled `stylex.create` namespaces (`{k1xSpc:`x1lliihq`,$$css:!0}`) and inlined `stylex.props` results.
    for (const [object] of code.matchAll(/\{[^{}]*\$\$css[^{}]*\}/g)) {
      for (const match of object.matchAll(/:\s*(?:`([^`]*)`|"([^"]*)"|'([^']*)')/g)) use(match[1] ?? match[2] ?? match[3], url);
    }
    for (const match of code.matchAll(/className:\s*(?:`([^`$]*)`|"([^"]*)")/g)) use(match[1] ?? match[2], url);
  } else if (url.endsWith('.html')) {
    // Inlined CSS is per page, so a page's own classes must be defined by its own styles or a standalone
    // file. Redirect pages carry no stylesheet by design (Redirect.astro) and only need the global rule.
    const html = read(url);
    const redirect = isRedirect(html);
    for (const match of html.matchAll(/\sclass="([^"]*)"/g)) {
      use(match[1], url);
      if (redirect) continue;
      for (const name of match[1].split(/\s+/)) {
        if (ATOMIC.test(name) && !standalone.has(name) && !inline.get(url).has(name)) own.set(`${url} ${name}`, `${url}: class "${name}" has no rule in the page's own CSS`);
      }
    }
  }
}

for (const [name, url] of used) if (!defined.has(name)) failures.push(`${url}: class "${name}" has no rule in the dist CSS`);
for (const failure of own.values()) failures.push(failure);

if (defined.size === 0) failures.push(`${DIST}: no CSS rules found in standalone .css files or inline <style> blocks`);
console.log(`check:stylex: ${used.size} StyleX classes used, ${defined.size} classes defined (${styleBlocks} inline <style> blocks)`);
report('check:stylex', failures);
