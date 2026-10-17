import type {APIRoute} from 'astro';
import {getPosts} from '../../content/posts';
import {CATALOGS, type Locale} from '../../i18n/locales';
import {localePaths, routes} from '../../i18n/routes';
import {SECTIONS, entryLink} from '../../ui/chrome/sections';

export const getStaticPaths = localePaths;
const HOME_ENTRIES = ['overlay', 'binpkg', 'distfilesSetup', 'liveIso', 'packages', 'status'] as const;

export const GET: APIRoute = async ({props}) => {
  const locale = props.locale as Locale;
  const messages = CATALOGS[locale];
  const pages = SECTIONS.flatMap(section => section.pages);
  const entries = HOME_ENTRIES.map(id => {
    const entry = pages.find(page => page.id === id)!;
    return {url: entryLink(locale, entry).href, title: messages[`gz.nav.${id}`], excerpt: messages[`gz.section.sub.${id}`]};
  });
  const posts = (await getPosts(locale)).slice(0, 3).map(post => ({
    url: routes.post(locale, post.data.slug), title: post.data.title, excerpt: post.data.description,
  }));
  return Response.json([...entries, ...posts]);
};
