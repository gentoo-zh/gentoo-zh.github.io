import {createElement} from 'react';
import type {Post} from '../content/posts';
import type {Locale} from '../i18n/locales';
import {routes} from '../i18n/routes';
import {PostMarkdown} from '../markdown/PostMarkdown';
import {SITE} from '../site';
import {feedHtml} from './feedHtml';
import {SiteI18n} from './SiteProviders';
import {renderStatic} from './renderStatic';

/** Feed HTML for one post; see feedHtml for the URL and attribute rules. */
export async function renderFeedBody(locale: Locale, post: Post, pages: ReadonlySet<string>): Promise<string> {
  const page = new URL(routes.post(locale, post.data.slug), SITE.origin);
  const body = createElement(PostMarkdown, {locale, pages, children: post.body ?? ''});
  const html = await renderStatic(createElement(SiteI18n, {locale, children: body}));
  return feedHtml(html, page);
}
