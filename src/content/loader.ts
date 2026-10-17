import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {Loader} from 'astro/loaders';
import {parseFrontmatter} from 'astro/markdown';
import {LOCALES} from '../i18n/locales';

export const CONTENT_ROOT = 'content';

/** Bundle directories under `content/<locale>/posts/`, each holding an `index.md`. */
export function postBundles(locale: string): string[] {
  return readdirSync(join(CONTENT_ROOT, locale, 'posts'), {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

/**
 * Reads Markdown as text and front matter only. Astro's own Markdown pipeline never
 * runs; the body is rendered by Astryx `Markdown` at build time.
 */
export function markdownLoader(name: string, files: (locale: string) => Array<[id: string, path: string]>): Loader {
  return {
    name,
    async load({store, parseData, generateDigest}) {
      store.clear();
      for (const locale of LOCALES) {
        for (const [id, path] of files(locale)) {
          const source = readFileSync(path, 'utf8');
          const {frontmatter, content} = parseFrontmatter(source);
          const entryId = `${locale}/${id}`;
          const data = await parseData({id: entryId, data: {...frontmatter, locale, slug: id}});
          store.set({id: entryId, data, body: content, filePath: path, digest: generateDigest(source)});
        }
      }
    },
  };
}

export const postsLoader = markdownLoader('posts', locale =>
  postBundles(locale).map(dir => [dir, join(CONTENT_ROOT, locale, 'posts', dir, 'index.md')]),
);

export const sectionsLoader = markdownLoader('sections', locale => [['posts', join(CONTENT_ROOT, locale, 'posts', '_index.md')]]);

/** Single pages, `content/<locale>/<slug>/_index.md`, and the home page under the slug ''. */
export function pageSlugs(locale: string): string[] {
  return readdirSync(join(CONTENT_ROOT, locale), {withFileTypes: true})
    .filter(entry => entry.isDirectory() && !['posts', 'contributors'].includes(entry.name))
    .map(entry => entry.name);
}

export const pagesLoader = markdownLoader('pages', locale => [
  ['', join(CONTENT_ROOT, locale, '_index.md')],
  ...pageSlugs(locale).map((slug): [string, string] => [slug, join(CONTENT_ROOT, locale, slug, '_index.md')]),
]);
