import {createElement} from 'react';
import type {Post} from '../content/posts';
import type {Locale} from '../i18n/locales';
import {routes} from '../i18n/routes';
import {PostMarkdown} from '../markdown/PostMarkdown';
import {SITE} from '../site';
import {SiteI18n} from './SiteProviders';
import {renderStatic} from './renderStatic';

const SCHEME = /^[a-z][a-z\d+.-]*:/i;

/** Feed HTML uses absolute page/image URLs and drops styles unavailable to feed readers. */
export async function renderFeedBody(locale: Locale, post: Post, pages: ReadonlySet<string>): Promise<string> {
  const page = new URL(routes.post(locale, post.data.slug), SITE.origin);
  const body = createElement(PostMarkdown, {locale, pages, children: post.body ?? ''});
  const html = await renderStatic(createElement(SiteI18n, {locale, children: body}));
  return html
    .replace(/\s(?:class|style)="[^"]*"/g, '')
    .replace(/\s(href|src)="([^"]*)"/g, (attribute, name: string, value: string) =>
      value.startsWith('#') || SCHEME.test(value)
        ? attribute
        : ` ${name}="${new URL(value.replaceAll('&amp;', '&'), page).href.replaceAll('&', '&amp;')}"`,
    );
}
