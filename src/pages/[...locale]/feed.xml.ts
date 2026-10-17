import type {APIRoute} from 'astro';
import {renderFeed} from '../../content/feed';
import {getPosts} from '../../content/posts';
import type {Locale} from '../../i18n/locales';
import {localePaths, routes} from '../../i18n/routes';
import {renderFeedBody} from '../../ui/renderFeedBody';

export const getStaticPaths = localePaths;

export const GET: APIRoute = async ({props}) => {
  const locale = props.locale as Locale;
  const pages = new Set((await getPosts(locale)).map(post => routes.post(locale, post.data.slug)));
  const xml = await renderFeed(locale, post => renderFeedBody(locale, post, pages));
  return new Response(xml, {headers: {'Content-Type': 'application/rss+xml; charset=utf-8'}});
};
