// StyleX: every atomic class the built pages or bundles use has a rule in the shipped CSS. Rules
// compiled only in the client build used to be dropped silently, so island styles never applied.
import {readFileSync} from 'node:fs';
import {fileFor, listFiles, report} from './lib/html.mjs';

const DIST = 'dist';
/** StyleX atomic classes: this site's `p` prefix (astro.config.ts) and Astryx's default `x`. */
const ATOMIC = /^[px][a-z0-9]{5,9}$/;
const failures = [];

const files = listFiles(DIST);
const read = url => readFileSync(fileFor(DIST, url), 'utf8');
const defined = new Set(files.filter(url => url.endsWith('.css')).flatMap(url => [...read(url).matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map(match => match[1])));

/** Class name → the first file that uses it. */
const used = new Map();
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
    for (const match of read(url).matchAll(/\sclass="([^"]*)"/g)) use(match[1], url);
  }
}

for (const [name, url] of used) if (!defined.has(name)) failures.push(`${url}: class "${name}" has no rule in the dist CSS`);

console.log(`check:stylex: ${used.size} StyleX classes used, ${defined.size} classes defined`);
report('check:stylex', failures);
