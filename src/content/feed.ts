import {CATALOGS, LANGUAGE_TAG, type Locale} from '../i18n/locales';
import {routes} from '../i18n/routes';
import {SITE} from '../site';
import {getPosts, type Post} from './posts';

const ESCAPES: Record<string, string> = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'};
const escape = (text: string) => text.replace(/[&<>"']/g, char => ESCAPES[char]);
const absolute = (path: string) => new URL(path, SITE.origin).href;

/**
 * RSS 2.0 at the Hugo addresses, newest first. Like Hugo's feed, each item's description is
 * the full post as escaped HTML; `renderBody` comes from the UI layer, which renders posts.
 */
export async function renderFeed(locale: Locale, renderBody: (post: Post) => Promise<string>): Promise<string> {
  const catalog = CATALOGS[locale];
  const posts = await getPosts(locale);
  const bodies = await Promise.all(posts.map(renderBody));
  const items = posts.map((post, index) => {
    const link = absolute(routes.post(locale, post.data.slug));
    return [
      '    <item>',
      `      <title>${escape(post.data.title)}</title>`,
      `      <link>${link}</link>`,
      `      <pubDate>${post.data.date.toUTCString()}</pubDate>`,
      `      <guid>${link}</guid>`,
      `      <description>${escape(bodies[index])}</description>`,
      '    </item>',
    ].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escape(catalog['gz.site.title'])}</title>`,
    `    <link>${absolute(routes.home(locale))}</link>`,
    `    <description>${escape(catalog['gz.site.description'])}</description>`,
    `    <language>${LANGUAGE_TAG[locale]}</language>`,
    ...(posts.length > 0 ? [`    <lastBuildDate>${posts[0].data.date.toUTCString()}</lastBuildDate>`] : []),
    `    <atom:link href="${absolute(routes.feed(locale))}" rel="self" type="application/rss+xml" />`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
