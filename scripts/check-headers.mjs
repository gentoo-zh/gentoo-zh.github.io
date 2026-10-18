// Caching: every fingerprinted file in dist matches exactly one immutable Cache-Control rule of
// dist/_headers, every non-fingerprinted static image matches exactly one short-lived rule, no
// other file or page matches any Cache-Control rule, and the site-wide security headers carried
// over from the Hugo site are present.
import {existsSync, readFileSync} from 'node:fs';
import {listFiles, report} from './lib/html.mjs';

const DIST = 'dist';
const IMMUTABLE = 'public, max-age=31536000, immutable';
const STATIC_IMAGE = 'public, max-age=86400, stale-while-revalidate=604800';
const SECURITY = {'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Content-Type-Options': 'nosniff', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'};
/** Astro names bundles `<name>.<8-character hash>.<ext>` and font files `fonts/<16-hex content hash>.<ext>`; Pagefind names index chunks `<language>_<hex>.pf_*`. */
const ASTRO_HASHED = /^\/_astro\/(?:.+\.[\w-]{8}|fonts\/[0-9a-f]{16})\.\w+$/;
const PAGEFIND_HASHED = /^\/pagefind\/.*_[0-9a-f]{7,}\.pf_\w+$/;
/** Images that keep their names when replaced: per-language contributor and post images, and the image-only directories and icons in `public/`. */
const STATIC_IMAGES = [
  /^\/(?:(?:en|zh-tw)\/)?(?:contributors|posts)\/.+\.(?:webp|png|jpg|svg|gif)$/,
  /^\/(?:img|brand|authors)\/.+$/,
  /^\/(?:favicon[^/]*|apple-touch-icon\.png)$/,
];
const failures = [];

/** Cloudflare's `_headers`: a path pattern line, then indented `Name: value` lines. */
function parseHeaders(text) {
  const rules = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.length > 2000) failures.push('_headers: line exceeds 2000 characters');
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      rules.push({pattern: line.trim(), headers: []});
      continue;
    }
    const [, name, value] = /^\s+([^:]+):\s*(.*)$/.exec(line) ?? [];
    if (name == null || rules.length === 0) failures.push(`_headers: cannot parse "${line}"`);
    else rules.at(-1).headers.push({name: name.trim(), value: value.trim()});
  }
  return rules;
}

/** `*` matches anything, `:name` one path segment; the whole path must match. */
function matcher(pattern) {
  const source = pattern
    .split(/(\*|:\w+)/)
    .map(part => (part === '*' ? '.*' : part.startsWith(':') ? '[^/]+' : part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')))
    .join('');
  return new RegExp(`^${source}$`);
}

const headersFile = `${DIST}/_headers`;
const rules = existsSync(headersFile) ? parseHeaders(readFileSync(headersFile, 'utf8')).map(rule => ({...rule, test: matcher(rule.pattern)})) : [];
if (rules.length === 0) failures.push(`${headersFile} is missing or empty`);
if (rules.length > 100) failures.push(`_headers has ${rules.length} rules; Cloudflare reads at most 100`);

const files = listFiles(DIST).filter(url => url !== '/_headers');
// A page is requested by its directory address as well as by its file.
const addresses = files.flatMap(url => (url.endsWith('/index.html') ? [url, url.slice(0, -'index.html'.length)] : [url]));

for (const address of addresses) {
  const cacheRules = rules.filter(rule => rule.test.test(address) && rule.headers.some(({name}) => name.toLowerCase() === 'cache-control'));
  const cacheValues = cacheRules.flatMap(rule => rule.headers.filter(({name}) => name.toLowerCase() === 'cache-control').map(({value}) => value));
  const hashed = ASTRO_HASHED.test(address) || PAGEFIND_HASHED.test(address);
  const staticImage = !hashed && STATIC_IMAGES.some(pattern => pattern.test(address));
  if (address.startsWith('/_astro/') && !hashed) failures.push(`${address}: under /_astro/ without a content hash in its name`);
  if (hashed) {
    if (cacheValues.length !== 1 || cacheValues[0] !== IMMUTABLE) {
      failures.push(`${address}: fingerprinted, expected one "Cache-Control: ${IMMUTABLE}", got ${JSON.stringify(cacheValues)}`);
    }
  } else if (staticImage) {
    if (cacheValues.length !== 1 || cacheValues[0] !== STATIC_IMAGE) {
      failures.push(`${address}: static image, expected one "Cache-Control: ${STATIC_IMAGE}", got ${JSON.stringify(cacheValues)}`);
    }
  } else if (cacheRules.length > 0) {
    failures.push(`${address}: not fingerprinted but matches ${cacheRules.map(rule => rule.pattern).join(', ')}; it must keep max-age=0`);
  }
}

for (const [name, value] of Object.entries(SECURITY)) {
  for (const address of ['/', '/posts/', '/_astro/x.12345678.js']) {
    const values = rules.filter(rule => rule.test.test(address)).flatMap(rule => rule.headers.filter(header => header.name === name).map(header => header.value));
    if (values.length !== 1 || values[0] !== value) failures.push(`${address}: expected one "${name}: ${value}", got ${JSON.stringify(values)}`);
  }
}

const countOf = predicate => addresses.filter(predicate).length;
const isHashed = address => ASTRO_HASHED.test(address) || PAGEFIND_HASHED.test(address);
console.log(`check:headers: ${countOf(isHashed)} fingerprinted files, ${countOf(address => !isHashed(address) && STATIC_IMAGES.some(pattern => pattern.test(address)))} static images, ${rules.length} rules`);
report('check:headers', failures);
