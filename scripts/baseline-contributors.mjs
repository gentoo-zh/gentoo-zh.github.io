// Records the contributor addresses and list order into scripts/baseline/p3-contributors.json.
// Usage: node scripts/baseline-contributors.mjs <hugo-output-dir> <master-sha>
//        node scripts/baseline-contributors.mjs --content
// The first form reads a Hugo build of master. `--content` keeps the recorded addresses that are not
// profiles, replaces the profile addresses with those of every bundle in content/<locale>/contributors/,
// and takes the order from those files. update-contributors.py prunes accounts that left the organisation
// on purpose, so a bundle that is gone retires its address instead of failing check:urls forever.
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {parseFrontmatter} from 'astro/markdown';
import {groupContributors} from '../src/content/contributorOrder.ts';
import {listFiles, readPage} from './lib/html.mjs';

const MANIFEST = new URL('./baseline/p3-contributors.json', import.meta.url);
const PREFIXES = {'zh-cn': '', 'zh-tw': '/zh-tw', en: '/en'};
const [root, masterSha] = process.argv.slice(2);

function fromHugo() {
  const files = listFiles(root);
  const pages = [];
  const bundleFiles = [];
  const order = {};

  for (const [locale, prefix] of Object.entries(PREFIXES)) {
    const inLocale = url => (prefix === '' ? !/^\/(zh-tw|en)\//.test(url) : url.startsWith(`${prefix}/`));
    const local = files.filter(inLocale).map(url => url.slice(prefix.length));
    const profile = new RegExp(`href="${prefix}/contributors/[^/"]+/"`);

    pages.push(`${prefix}/contributors/`);
    for (const url of local) {
      const bundle = /^\/contributors\/([^/]+)\/(index\.html|[^/]+\.webp)$/.exec(url);
      // Resized copies (`_hu_<hash>`) are named by Hugo's image pipeline and only referenced from its own pages.
      if (bundle != null && bundle[2] === 'index.html') pages.push(`${prefix}/contributors/${bundle[1]}/`);
      else if (bundle != null && !bundle[2].includes('_hu_')) bundleFiles.push(`${prefix}${url}`);
      const tag = /^\/tags\/([^/]+)\/index\.html$/.exec(url);
      if (tag != null && profile.test(readPage(root, `${prefix}/tags/${tag[1]}/`))) {
        pages.push(`${prefix}/tags/${tag[1]}/`);
      }
    }

    const list = readPage(root, `${prefix}/contributors/`);
    order[locale] = [...list.matchAll(/<section>([\s\S]*?)<\/section>/g)].map(([, section]) =>
      [...section.matchAll(/<a href="[^"]*\/contributors\/([^/"]+)\/" class="contributor-card"/g)].map(([, slug]) => slug),
    );
  }
  return {masterSha, pages, files: bundleFiles, order};
}

function fromContent() {
  const snapshot = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const profile = (prefix, url) => new RegExp(`^${prefix}/contributors/[^/]+/`).test(url);
  const pages = new Set(snapshot.pages.filter(url => !Object.values(PREFIXES).some(prefix => profile(prefix, url))));
  const files = new Set(snapshot.files.filter(url => !Object.values(PREFIXES).some(prefix => profile(prefix, url))));
  for (const [locale, prefix] of Object.entries(PREFIXES)) {
    const base = join('content', locale, 'contributors');
    const entries = readdirSync(base, {withFileTypes: true})
      .filter(entry => entry.isDirectory())
      .map(({name}) => {
        const slug = name.toLowerCase();
        pages.add(`${prefix}/contributors/${slug}/`);
        for (const file of readdirSync(join(base, name)).filter(file => file.endsWith('.webp'))) {
          files.add(`${prefix}/contributors/${slug}/${file}`);
        }
        return {slug, data: parseFrontmatter(readFileSync(join(base, name, 'index.md'), 'utf8')).frontmatter};
      });
    snapshot.order[locale] = groupContributors(entries).map(({contributors}) => contributors.map(({slug}) => slug));
  }
  return {...snapshot, pages: [...pages], files: [...files]};
}

if (root !== '--content' && (root == null || !/^[0-9a-f]{40}$/.test(masterSha ?? ''))) {
  console.error('usage: node scripts/baseline-contributors.mjs <hugo-output-dir> <master-sha> | --content');
  process.exit(2);
}
const snapshot = root === '--content' ? fromContent() : fromHugo();
snapshot.pages.sort();
snapshot.files.sort();
writeFileSync(MANIFEST, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`pages ${snapshot.pages.length}, files ${snapshot.files.length}, sections ${Object.values(snapshot.order).map(sections => sections.length).join('/')}`);
