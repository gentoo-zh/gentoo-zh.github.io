// Preserve baseline URLs, redirects, feeds and heading anchors; validate current pages and links.
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {parseFrontmatter} from 'astro/markdown';
import {decodeEntities, fileFor, ids, listFiles, parseFeed, readPage, refreshTarget, report} from './lib/html.mjs';
import {CURRENT_PAGES, FILES_REWRITES, SITEMAP_REDIRECTS, EXTRA_REDIRECTS, FRAGMENT_REDIRECTS, PAGE_SLUGS, PROMOTED_REDIRECTS, slugPaths} from './lib/url-manifest.mjs';
import {legacyAnchors, redirectAnchors} from './lib/html-elements.mjs';
import {RETIRED_REDIRECTS} from './lib/retired-posts.mjs';

const DIST = 'dist';
const ORIGIN = 'https://gentoozh.org';
const baseline = JSON.parse(readFileSync(new URL('./baseline/hugo.json', import.meta.url), 'utf8'));
const failures = [];
const fragmentMaps = new Map();
const redirectRules = readFileSync(fileFor(DIST, '/_redirects'), 'utf8').trim().split(/\r?\n/);
let staticRedirects = 0;
let dynamicRedirects = 0;
for (const rule of redirectRules) {
  if (!rule.trim() || rule.trimStart().startsWith('#')) continue;
  const [source, target, code, extra] = rule.split(/\s+/);
  const rewrite = code === '200' && FILES_REWRITES[source] === target;
  if (!source.startsWith('/') || !target || !(rewrite || ['301', '302', '303', '307', '308'].includes(code)) || extra || rule.length > 1000) failures.push(`invalid Workers redirect: ${rule}`);
  if (/[*:]/.test(source)) dynamicRedirects++;
  else {
    staticRedirects++;
    if (dynamicRedirects) failures.push(`static redirect follows dynamic rule: ${source}`);
  }
}
if (staticRedirects > 2000 || dynamicRedirects > 100) failures.push(`Workers redirect limits exceeded: ${staticRedirects} static, ${dynamicRedirects} dynamic`);
for (const [from, to] of Object.entries(FILES_REWRITES)) {
  if (redirectRules.filter(row => row.split(/\s+/)[0] === from).join() !== `${from} ${to} 200`) failures.push(`${from}: expected exactly one rewrite to ${to}`);
}
console.log(`check:urls: ${staticRedirects} static redirects, ${dynamicRedirects} dynamic redirects`);
for (const [from, to] of Object.entries(SITEMAP_REDIRECTS)) {
  if (redirectRules.filter(row => row.split(/\s+/)[0] === from).join() !== `${from} ${to} 301`) failures.push(`${from}: expected exactly one permanent redirect to ${to}`);
  if (!existsSync(fileFor(DIST, to))) failures.push(`${from}: missing redirect target ${to}`);
}

for (const [path, target] of Object.entries(FRAGMENT_REDIRECTS)) {
  const html = readPage(DIST, path) ?? '';
  if (refreshTarget(html) !== target) failures.push(`${path}: expected redirect fallback to ${target}`);
  const anchors = redirectAnchors(html);
  if (!anchors || !Object.keys(anchors).length) failures.push(`${path}: missing redirect fragment map`);
  fragmentMaps.set(path, anchors ?? {});
}

// Single pages in the manifest: Hugo's pages stay pages, Hugo's redirects keep their targets.
const BUILT = new Set(CURRENT_PAGES);
for (const path of CURRENT_PAGES) {
  const html = readPage(DIST, path);
  if (html == null) failures.push(`missing current page ${path}`);
  else if (refreshTarget(html) != null) failures.push(`${path}: current page must not redirect`);
}
for (const path of [...PAGE_SLUGS.flatMap(slugPaths), ...EXTRA_REDIRECTS]) {
  const redirect = baseline.allRedirects[path];
  if (baseline.allPages.includes(path)) {
    BUILT.add(path);
    const html = readPage(DIST, path);
    if (html == null) failures.push(`missing ${path}`);
    else if (refreshTarget(html) != null) failures.push(`${path}: Hugo serves a page here, the build a redirect`);
  } else if (redirect != null && PROMOTED_REDIRECTS.includes(path)) {
    BUILT.add(path);
    const html = readPage(DIST, path);
    if (html == null || refreshTarget(html) != null) failures.push(`${path}: Hugo redirected to ${redirect}; the build must serve the page`);
  } else if (redirect != null) {
    BUILT.add(path);
    const actual = refreshTarget(readPage(DIST, path) ?? '');
    if (actual !== redirect) failures.push(`redirect ${path}: expected ${redirect}, got ${actual ?? 'none'}`);
  }
}

const contributors = JSON.parse(readFileSync(new URL('./baseline/p3-contributors.json', import.meta.url), 'utf8'));
for (const url of [...contributors.files, ...contributors.pages]) {
  if (!existsSync(fileFor(DIST, url))) failures.push(`missing ${url}`);
}

for (const [page, target] of Object.entries(baseline.redirects)) {
  const actual = refreshTarget(readPage(DIST, page) ?? '');
  if (actual !== target) failures.push(`redirect ${page}: expected ${target}, got ${actual ?? 'none'}`);
}

// Read the current bundles independently of the feed so omitted and stale items fail.
const postPages = [];
for (const [url, expected] of Object.entries(baseline.feeds)) {
  const locale = expected.language.toLowerCase();
  const root = `content/${locale}/posts`;
  const collator = new Intl.Collator(expected.language);
  const posts = readdirSync(root, {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(({name}) => {
      const {frontmatter} = parseFrontmatter(readFileSync(`${root}/${name}/index.md`, 'utf8'));
      const date = new Date(frontmatter.date);
      const link = new URL(`posts/${name}/`, expected.link).href;
      postPages.push(new URL(link).pathname);
      return {title: frontmatter.title, link, guid: link, pubDate: Number.isNaN(date.getTime()) ? null : date.toISOString()};
    })
    .sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate) || collator.compare(a.title, b.title));
  for (const post of posts) {
    if (post.pubDate == null) failures.push(`${post.link}: current post date missing or invalid`);
    if (readPage(DIST, new URL(post.link).pathname) == null) failures.push(`missing current post ${post.link}`);
  }
  const xml = readPage(DIST, url);
  if (xml == null) {
    failures.push(`missing ${url}`);
    continue;
  }
  const actual = parseFeed(xml);
  for (const field of ['link', 'language', 'self']) {
    if (actual[field] !== expected[field]) failures.push(`${url} ${field}: expected ${expected[field]}, got ${actual[field]}`);
  }
  for (const item of actual.items.filter(({pubDate}) => pubDate == null)) failures.push(`${url} item ${item.link}: pubDate missing or invalid`);
  if (JSON.stringify(actual.items) !== JSON.stringify(posts)) {
    failures.push(`${url} items differ from current posts (title, URL, date, or newest-first order)`);
  }
  // Titles and new posts may change; every Hugo feed item link stays in the feed unless its post retired.
  const links = new Set(actual.items.map(({link}) => link));
  for (const {link} of expected.items) {
    if (!links.has(link) && !Object.hasOwn(RETIRED_REDIRECTS, new URL(link).pathname)) failures.push(`${url}: Hugo feed item ${link} is missing`);
  }
  actual.items.forEach(({link}, index) => {
    const body = actual.bodies[index];
    let page;
    try {
      const target = new URL(link);
      if (target.origin !== ORIGIN) throw new Error('foreign origin');
      page = target.pathname;
    } catch {
      failures.push(`${url} item ${link}: expected an absolute site URL`);
      return;
    }
    if (body.trim() === '') failures.push(`${url} item ${link}: description is empty`);
    const present = new Set(ids(body));
    const html = readPage(DIST, page) ?? '';
    for (const [heading] of html.matchAll(/<h[1-6]\b[^>]*>/g)) {
      for (const id of ids(heading)) {
        if (!present.has(id)) failures.push(`${url} item ${link}: description lacks #${id}; not the full post`);
      }
    }
    for (const [, address] of body.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
      if (!/^(?:[a-z][a-z\d+.-]*:|#)/i.test(address)) failures.push(`${url} item ${link}: relative address ${address}`);
    }
  });
}

// A retired post redirects permanently to a current page; its old path carries no post.
for (const [path, target] of Object.entries(RETIRED_REDIRECTS)) {
  if (postPages.includes(path)) failures.push(`${path}: retired post is still published`);
  const actual = refreshTarget(readPage(DIST, path) ?? '');
  if (actual == null || new URL(actual, ORIGIN).href !== new URL(target, ORIGIN).href) failures.push(`retired post ${path}: expected redirect to ${target}, got ${actual ?? 'none'}`);
  if (!CURRENT_PAGES.includes(target)) failures.push(`retired post ${path}: target ${target} is not a current page`);
}

// New headings are allowed; existing heading IDs remain valid link targets, except on retired posts.
const historicalIds = new Map();
for (const page of new Set([...postPages, ...Object.keys(baseline.headings)])) {
  if (Object.hasOwn(RETIRED_REDIRECTS, page)) continue;
  const expectedIds = baseline.headings[page] ?? [];
  const html = readPage(DIST, page) ?? '';
  const actualIds = ids(html);
  for (const [heading, level, attributes, inner] of html.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/g)) {
    const own = ids(` ${attributes}`);
    if (own.length > 1 || ids(inner).length > 0) {
      failures.push(`${page}: heading ${heading.slice(0, 80)}… must carry one id, on itself`);
    }
    const selfLinks = [...inner.matchAll(/\shref="#([^"]*)"/g)].map(([, fragment]) => decodeEntities(fragment));
    if (level !== '1' && own.length === 1 && !selfLinks.includes(own[0])) {
      failures.push(`${page}#${own[0]}: heading has no permalink to itself`);
    }
  }
  historicalIds.set(page, expectedIds.filter(id => !actualIds.includes(id)));
}

const pages = listFiles(DIST).filter(url => url.endsWith('/index.html'));
const idsByPage = new Map(pages.map(url => [url.slice(0, -'index.html'.length), ids(readFileSync(fileFor(DIST, url), 'utf8'))]));
// A paged post's overview sends the ids that moved to its section pages on in the browser through a
// LegacyAnchors map; those ids resolve through it like a redirect page's fragments. Other pages' maps
// (FAQ, overlay) predate this check and are not read.
for (const url of pages.filter(url => /^\/(?:zh-tw\/|en\/)?posts\//.test(url))) {
  const html = readFileSync(fileFor(DIST, url), 'utf8');
  const anchors = legacyAnchors(html);
  if (anchors) fragmentMaps.set(url.slice(0, -'index.html'.length), anchors);
}

function fragmentExists(path, id) {
  const anchors = fragmentMaps.get(path);
  if (anchors && Object.hasOwn(anchors, id)) {
    const target = new URL(anchors[id], `${ORIGIN}${path}`);
    return target.origin === ORIGIN && idsByPage.get(decodeURIComponent(target.pathname))?.includes(decodeURIComponent(target.hash.slice(1)));
  }
  return idsByPage.get(path)?.includes(id);
}

for (const [page, absent] of historicalIds) {
  const missing = absent.filter(id => !fragmentExists(page, id));
  if (missing.length) failures.push(`${page}: missing historical heading ids: ${missing.join(', ')}`);
}

for (const [path, anchors] of fragmentMaps) {
  for (const id of Object.keys(anchors)) {
    if (!fragmentExists(path, id)) failures.push(`${path}#${id}: redirect fragment has no target`);
  }
}

for (const [page, pageIds] of idsByPage) {
  const html = readPage(DIST, page);
  const seen = new Set();
  for (const id of pageIds) {
    if (seen.has(id)) failures.push(`${page}: duplicate id "${id}"`);
    seen.add(id);
  }
  if (/\{\{(?:&lt;|<|%)/.test(html)) failures.push(`${page}: unrendered Hugo shortcode`);
  for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
    const url = new URL(href.replaceAll('&amp;', '&'), `${ORIGIN}${page}`);
    if (url.origin !== ORIGIN) continue;
    const path = decodeURIComponent(url.pathname);
    // Check all same-origin links, including paths outside the page manifest; directories below
    // /files/ are served by the files page (FILES_REWRITES).
    const served = Object.entries(FILES_REWRITES).find(([from]) => path.startsWith(from.slice(0, -1)))?.[1] ?? path;
    if (!existsSync(fileFor(DIST, served))) failures.push(`${page}: link ${href} has no page`);
    const targetIds = idsByPage.get(path);
    if (url.hash === '' || targetIds == null) continue;
    if (!fragmentExists(path, decodeURIComponent(url.hash.slice(1)))) failures.push(`${page}: link ${href} has no target`);
  }
}

const historical = JSON.parse(readFileSync(new URL('./baseline/historical-fragments.json', import.meta.url), 'utf8'));
for (const [page, fragments] of Object.entries(historical.pages)) {
  for (const fragment of fragments) {
    if (!fragmentExists(page, fragment)) failures.push(`${page}: missing historical fragment #${fragment}`);
  }
}

report('check:urls', failures);
