import {LANGUAGE_TAG, type Locale} from '../i18n/locales';
import {routes} from '../i18n/routes';
import {useMessage} from '../i18n/useMessage';
import {SITE} from '../site';
import {SECTIONS, menuEntries, sectionHref, type SectionId} from './chrome/sections';
import {SiteI18n} from './SiteProviders';

export interface SiteHeadProps {
  locale: Locale;
  title?: string;
  description?: string;
  path: string;
  alternates: Partial<Record<Locale, string>>;
  section?: SectionId;
  noindex?: boolean;
  article?: {
    title: string;
    datePublished: string;
    dateModified: string;
    authors: Array<{name: string; link?: string}>;
  };
}

/**
 * Without scripting nothing replaces the loading placeholders: drop the busy regions
 * (`data-gz-skeleton`), stop every animation, and show the static notes (`data-gz-noscript`).
 */
const NO_SCRIPT_CSS = '[data-gz-skeleton]{display:none!important}[data-gz-noscript]{display:flex!important}*,*::before,*::after{animation:none!important}';

const OG_LOCALE: Record<Locale, string> = {'zh-cn': 'zh_CN', 'zh-tw': 'zh_TW', en: 'en_US'};
const absolute = (path: string) => new URL(path, SITE.origin).href;

function HeadTags({locale, title, description, path, alternates, section, noindex, article}: SiteHeadProps) {
  const t = useMessage();
  const site = t('gz.site.title');
  const home = path === routes.home(locale);
  const pageTitle = home ? t('gz.seo.home.title') : title ?? site;
  const fullTitle = t('gz.page.title', {page: pageTitle, site});
  const summary = description ?? t('gz.site.description');
  const url = absolute(path);
  const image = absolute(SITE.shareImage);
  const organization = {'@type': 'Organization', '@id': `${SITE.origin}/#organization`, name: site, url: SITE.origin, logo: absolute(SITE.logo), sameAs: [SITE.github]};
  const graph: Record<string, unknown>[] = [];
  if (home) graph.push(organization, {'@type': 'WebSite', '@id': `${url}#website`, url, name: fullTitle, description: summary, inLanguage: LANGUAGE_TAG[locale], publisher: {'@id': organization['@id']}});
  if (!home && !noindex) {
    const crumbs = [{name: t('gz.seo.home.title'), item: absolute(routes.home(locale))}];
    const category = SECTIONS.find(entry => entry.id === section);
    if (category && sectionHref(locale, category) !== path) crumbs.push({name: t(`gz.nav.${category.id}`), item: absolute(sectionHref(locale, category))});
    if (article) crumbs.push({name: t('gz.nav.posts'), item: absolute(routes.posts(locale))});
    else if (path.startsWith(routes.tags(locale)) && path !== routes.tags(locale)) crumbs.push({name: t('gz.tags.title'), item: absolute(routes.tags(locale))});
    // Nested pages inherit the visible category while retaining their own final breadcrumb.
    else if (category) {
      const parent = menuEntries(locale, category).find(entry => !entry.link.isExternal && path !== entry.link.href && path.startsWith(entry.link.href));
      if (parent) crumbs.push({name: t(`gz.nav.${parent.entry.id}`), item: absolute(parent.link.href)});
    }
    crumbs.push({name: pageTitle, item: url});
    graph.push({'@type': 'BreadcrumbList', itemListElement: crumbs.map((crumb, index) => ({'@type': 'ListItem', position: index + 1, ...crumb}))});
  }
  if (article) graph.push({
    '@type': 'BlogPosting', '@id': `${url}#article`, mainEntityOfPage: url, url,
    headline: article.title, description: summary, inLanguage: LANGUAGE_TAG[locale], image,
    datePublished: article.datePublished, dateModified: article.dateModified,
    author: article.authors.length ? article.authors.map(author => ({'@type': 'Person', name: author.name, ...(author.link ? {url: author.link} : {})})) : [organization],
    publisher: organization,
  });
  const fallback = alternates['zh-cn'] ?? alternates[locale];
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={summary} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : <link rel="canonical" href={url} />}
      {Object.entries(alternates).map(([target, href]) => (
        <link key={target} rel="alternate" hrefLang={LANGUAGE_TAG[target as Locale]} href={absolute(href)} />
      ))}
      {fallback ? <link rel="alternate" hrefLang="x-default" href={absolute(fallback)} /> : null}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={summary} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:site_name" content={site} />
      <meta property="og:locale" content={OG_LOCALE[locale]} />
      {Object.keys(alternates).filter(target => target !== locale).map(target => <meta key={target} property="og:locale:alternate" content={OG_LOCALE[target as Locale]} />)}
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={t('gz.seo.image.alt')} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={summary} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={t('gz.seo.image.alt')} />
      {article ? <><meta property="article:published_time" content={article.datePublished} /><meta property="article:modified_time" content={article.dateModified} /></> : null}
      {graph.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replaceAll('<', '\\u003c')}} /> : null}
      <link rel="alternate" type="application/rss+xml" title={site} href={routes.feed(locale)} />
      <link rel="icon" href="/favicon.ico" sizes="32x32" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <noscript><style>{NO_SCRIPT_CSS}</style></noscript>
    </>
  );
}

export function SiteHead(props: SiteHeadProps) {
  return <SiteI18n locale={props.locale}><HeadTags {...props} /></SiteI18n>;
}
