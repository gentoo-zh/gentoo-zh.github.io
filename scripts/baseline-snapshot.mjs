// Record the Hugo URL contract: posts, tags, feeds, heading ids, pages and redirects.
// Usage: node scripts/baseline-snapshot.mjs <hugo-output-dir> <master-sha>
import {mkdirSync, writeFileSync} from 'node:fs';
import {decodeEntities, listFiles, parseFeed, readPage, refreshTarget} from './lib/html.mjs';

const [root, masterSha] = process.argv.slice(2);
if (root == null || !/^[0-9a-f]{40}$/.test(masterSha ?? '')) {
  console.error('usage: node scripts/baseline-snapshot.mjs <hugo-output-dir> <master-sha>');
  process.exit(2);
}

const PREFIXES = ['', '/zh-tw', '/en'];
const files = listFiles(root);
const pages = [];
const redirects = {};
const headings = {};
const feeds = {};

for (const prefix of PREFIXES) {
  const inLocale = url => (prefix === '' ? !/^\/(zh-tw|en)\//.test(url) : url.startsWith(`${prefix}/`));
  const local = files.filter(inLocale).map(url => url.slice(prefix.length));

  pages.push(`${prefix}/posts/`, `${prefix}/tags/`);
  for (const url of local) {
    const post = /^\/posts\/([^/]+)\/(index\.html|[^/]+\.(?:webp|png|jpe?g|gif|svg))$/.exec(url);
    if (post != null && post[1] !== 'page') {
      const page = `${prefix}/posts/${post[1]}/`;
      if (post[2] === 'index.html') {
        pages.push(page);
        const html = readPage(root, page);
        headings[page] = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)]
          .flatMap(([, , inner]) => [...inner.matchAll(/\sid="([^"]+)"/g)].map(match => decodeEntities(match[1])))
          .filter(id => !id.startsWith('hx'));
      } else {
        pages.push(`${prefix}${url}`);
      }
    }
    const tag = /^\/tags\/([^/]+)\/index\.html$/.exec(url);
    // Contributor-only tags use the separate contributor baseline.
    if (tag != null && /href="[^"]*\/posts\/\d{4}-/.test(readPage(root, `${prefix}/tags/${tag[1]}/`))) {
      pages.push(`${prefix}/tags/${tag[1]}/`);
    }
  }

  for (const url of local) {
    if (!url.endsWith('/index.html')) continue;
    const page = `${prefix}${url.slice(0, -'index.html'.length)}`;
    const target = refreshTarget(readPage(root, page) ?? '');
    const isP1 = page.startsWith(`${prefix}/website/`) || page === `${prefix}/posts/page/1/`;
    if (target != null && isP1) redirects[page] = target;
  }
  const {bodies, ...feed} = parseFeed(readPage(root, `${prefix}/feed.xml`));
  feeds[`${prefix}/feed.xml`] = feed;
}

const allPages = [];
const allRedirects = {};
for (const url of files.filter(url => url.endsWith('/index.html'))) {
  const page = url.slice(0, -'index.html'.length);
  const html = readPage(root, page) ?? '';
  const target = refreshTarget(html);
  if (target != null) allRedirects[page] = target;
  else allPages.push(page);
}

const snapshot = {
  masterSha,
  pages: [...new Set(pages)].sort(),
  redirects,
  headings,
  feeds,
  allPages: allPages.sort(),
  allRedirects: Object.fromEntries(Object.entries(allRedirects).sort()),
};
mkdirSync(new URL('./baseline/', import.meta.url), {recursive: true});
writeFileSync(new URL('./baseline/hugo.json', import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`pages ${snapshot.pages.length}, redirects ${Object.keys(redirects).length}, feeds ${Object.keys(feeds).length}`);
