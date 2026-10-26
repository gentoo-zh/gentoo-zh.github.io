// Keep the command name for callers; cutover replaces byte parity with URL compatibility.
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {parseFrontmatter} from 'astro/markdown';
import {fileFor, readPage, refreshTarget, report} from './lib/html.mjs';
import {RETIRED_REDIRECTS} from './lib/retired-posts.mjs';

const ORIGIN = 'https://gentoozh.org';
const baseline = JSON.parse(readFileSync(new URL('./baseline/hugo.json', import.meta.url), 'utf8'));
const assets = JSON.parse(readFileSync(new URL('./baseline/historical-assets.json', import.meta.url), 'utf8'));
const failures = [];

for (const url of new Set([...baseline.pages, ...assets.files])) {
  if (!existsSync(fileFor('dist', url))) failures.push(`missing historical URL ${url}`);
  else if (Object.hasOwn(RETIRED_REDIRECTS, url)) {
    // A retired post survives as a permanent redirect, not as the page Hugo served.
    const actual = refreshTarget(readPage('dist', url));
    const expected = new URL(RETIRED_REDIRECTS[url], ORIGIN).href;
    if (actual == null || new URL(actual, ORIGIN).href !== expected) failures.push(`retired post ${url}: expected redirect to ${expected}, got ${actual ?? 'none'}`);
  }
}

// A paged post has the same section pages in every locale, so the language switch keeps the reader's section.
const PREFIX = {'zh-cn': '', 'zh-tw': '/zh-tw', en: '/en'};
const sections = (locale, slug) => {
  const dir = fileFor('dist', `${PREFIX[locale]}/posts/${slug}/`).replace(/index\.html$/, '');
  return existsSync(dir) ? readdirSync(dir).filter(name => /^\d+$/.test(name)).sort((a, b) => a - b).join(', ') : '';
};
const pagedSlugs = new Set(Object.keys(PREFIX).flatMap(locale =>
  readdirSync(`content/${locale}/posts`, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && parseFrontmatter(readFileSync(`content/${locale}/posts/${entry.name}/index.md`, 'utf8')).frontmatter.paged != null)
    .map(entry => entry.name),
));
for (const slug of pagedSlugs) {
  const found = Object.keys(PREFIX).map(locale => sections(locale, slug));
  if (found[0] === '' || new Set(found).size > 1) failures.push(`/posts/${slug}/: section pages differ by locale (${found.map(list => `[${list}]`).join(' ')})`);
}

report('check:content-parity', failures);
