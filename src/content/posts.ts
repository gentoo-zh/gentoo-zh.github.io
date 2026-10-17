import {parseMarkdownAst, visitMarkdownNodes} from '@astryxdesign/core/Markdown';
import {SITE} from '../site';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {getCollection, getEntry, type CollectionEntry} from 'astro:content';
import {DEFAULT_LOCALE, LANGUAGE_TAG, LOCALES, type Locale} from '../i18n/locales';
import {localePrefix, routes, tagSlug} from '../i18n/routes';
import {CONTENT_ROOT, postBundles} from './loader';

export type Post = CollectionEntry<'posts'>;

/** Hugo's default order: newest first, then by title in the locale's collation. */
export async function getPosts(locale: Locale): Promise<Post[]> {
  const posts = await getCollection('posts', post => post.data.locale === locale);
  const collator = new Intl.Collator(LANGUAGE_TAG[locale]);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || collator.compare(a.data.title, b.data.title));
}

export async function getSection(locale: Locale) {
  const section = await getEntry('sections', `${locale}/posts`);
  if (section == null) {
    throw new Error(`content/${locale}/posts/_index.md is missing`);
  }
  return section.data;
}

/** The same post in every locale that has it; no fallback to another language. */
export async function postAlternates(slug: string): Promise<Partial<Record<Locale, string>>> {
  const entries = await getCollection('posts', post => post.data.slug === slug);
  return Object.fromEntries(entries.map(post => [post.data.locale, routes.post(post.data.locale, slug)]));
}

export function localeAlternates(route: (locale: Locale) => string): Partial<Record<Locale, string>> {
  return Object.fromEntries(LOCALES.map(locale => [locale, route(locale)]));
}

/**
 * Tags in first-seen order of the newest posts, each with its posts. Tags that share a
 * slug (`Overlay`, `overlay`) are one tag, named as first seen, so each route is built once.
 */
export function groupByTag(posts: Post[]): Map<string, Post[]> {
  const bySlug = new Map<string, {tag: string; posts: Post[]}>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const group = bySlug.get(tagSlug(tag)) ?? {tag, posts: []};
      if (!group.posts.includes(post)) group.posts.push(post);
      bySlug.set(tagSlug(tag), group);
    }
  }
  return new Map([...bySlug.values()].map(({tag, posts: tagged}) => [tag, tagged]));
}

/** Files that sit next to a post's `index.md` and are served under the post URL. */
export function bundleFiles(locale: Locale): Array<{slug: string; file: string; path: string}> {
  return postBundles(locale).flatMap(slug => {
    const dir = join(CONTENT_ROOT, locale, 'posts', slug);
    return readdirSync(dir)
      .filter(file => file !== 'index.md')
      .map(file => ({slug, file, path: join(dir, file)}));
  });
}

export interface PostSummary {
  slug: string;
  title: string;
  description: string;
  /** `YYYY-MM-DD`, the date as written in front matter. */
  date: string;
  tags: string[];
  authors: Post['data']['authors'];
  image?: {src: string; alt: string};
  /** The front-matter cover only; the post page shows it above the body, which already holds any lead image. */
  cover?: {src: string; alt: string};
  /** The front-matter cover's dark-theme form, shown in place of `image` and `cover` under the dark theme. */
  coverDark?: {src: string; alt: string};
  tag?: string;
  pinned: boolean;
  coverPosition?: string;
}

function declaredImage(post: Post, declared: Post['data']['cover']): PostSummary['image'] {
  const image = typeof declared === 'string' ? {src: declared, alt: post.data.coverAlt ?? post.data.title} : declared;
  return image && siteImage(post, image);
}

/** Front matter wins; otherwise use the first rendered Markdown image, never an author avatar. */
function leadImage(post: Post): PostSummary['image'] {
  const declared = declaredImage(post, post.data.cover ?? post.data.image);
  if (declared) return declared;
  const images: Array<{src: string; alt?: string}> = [];
  visitMarkdownNodes(parseMarkdownAst(post.body ?? ''), 'image', node => {
    images.push({src: node.url, alt: node.alt ?? undefined});
  });
  return images[0] && siteImage(post, images[0]);
}

function siteImage(post: Post, image: {src: string; alt?: string}): PostSummary['image'] {
  const url = new URL(image.src, new URL(routes.post(post.data.locale, post.data.slug), SITE.origin));
  if (!['http:', 'https:'].includes(url.protocol)) return undefined;
  return {src: url.origin === SITE.origin ? `${url.pathname}${url.search}${url.hash}` : url.href, alt: image.alt ?? post.data.title};
}

export function summarize(post: Post): PostSummary {
  const {slug, title, description, date, tags, authors, tag, pinned = false, coverPosition} = post.data;
  return {slug, title, description, date: date.toISOString().slice(0, 10), tags, authors, image: leadImage(post), cover: declaredImage(post, post.data.cover), coverDark: post.data.cover ? declaredImage(post, post.data.coverDark) : undefined, tag, pinned, coverPosition};
}

/**
 * Old addresses kept as redirect pages: front-matter `aliases` (copied verbatim), Hugo's
 * `page/1`, and `/zh-cn/`, which Hugo writes because the default language lives at the root.
 */
export async function redirects(): Promise<Array<{from: string; to: string; locale: Locale}>> {
  const perLocale = await Promise.all(
    LOCALES.map(async locale => [
      {from: `${routes.posts(locale)}page/1/`, to: routes.posts(locale), locale},
      ...(await getPosts(locale)).flatMap(post =>
        post.data.aliases.map(alias => ({
          from: `${localePrefix(locale)}${alias}`,
          to: routes.post(locale, post.data.slug),
          locale,
        })),
      ),
    ]),
  );
  return [{from: `/${DEFAULT_LOCALE}/`, to: routes.home(DEFAULT_LOCALE), locale: DEFAULT_LOCALE}, ...perLocale.flat()];
}

/** Post paths that exist in a locale, for Markdown links that point at posts. */
export async function postPaths(locale: Locale): Promise<ReadonlySet<string>> {
  return new Set((await getPosts(locale)).map(post => routes.post(locale, post.data.slug)));
}
