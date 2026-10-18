// Navigation entries share their routes with category landings, sidebars and the mobile menu.
import type {Locale} from '../../i18n/locales';
import {routes} from '../../i18n/routes';
import {SITE} from '../../site';

export type SectionId = 'docs' | 'download' | 'community' | 'support' | 'about';

export type SectionPageId =
  | 'overlay'
  | 'binpkg'
  | 'binpkgSigning'
  | 'distfilesSetup'
  | 'liveIso'
  | 'officialMedia'
  | 'mirrorlist'
  | 'gentooMirrors'
  | 'packages'
  | 'files'
  | 'posts'
  | 'tags'
  | 'changelog'
  | 'contributors'
  | 'channels'
  | 'faq'
  | 'overlayTroubleshooting'
  | 'binpkgTroubleshooting'
  | 'distfilesTroubleshooting'
  | 'status'
  | 'paste'
  | 'forum'
  | 'overlayContributing'
  | 'websiteContributing'
  | 'gentooRepoSetup'
  | 'gentooDistfilesSetup'
  | 'gentooBinpkgSetup'
  | 'gentooPrefixSetup'
  | 'contributing'
  | 'costs'
  | 'thanks'
  | 'logo'
  | 'about';

export type SectionPage =
  /** A single page of this site at `/<slug>/`. */
  | {id: SectionPageId; kind: 'page'; slug: string; anchor?: Anchor}
  /** A route of its own (the post index, the tag index). */
  | {id: SectionPageId; kind: 'route'; href: (locale: Locale) => string}
  /** A service elsewhere; opens in a new tab. */
  | {id: SectionPageId; kind: 'external'; href: (locale: Locale) => string};

/**
 * A fragment id the landing page gives this entry's card, so links into the Hugo page that the
 * landing replaced (/download/#live-iso) still land on the topic. One id, or one per locale.
 */
export type Anchor = string | Record<Locale, string>;

export interface Section {
  id: SectionId;
  /** Landing page path segment: `/<slug>/`. */
  slug: string;
  /** Existing page used instead of a generated landing. */
  landingPage?: SectionPageId;
  pages: SectionPage[];
}

const page = (id: SectionPageId, slug: string, {anchor}: {anchor?: Anchor} = {}): SectionPage =>
  ({id, kind: 'page', slug, anchor});
const external = (id: SectionPageId, href: (locale: Locale) => string): SectionPage => ({id, kind: 'external', href});

export const SECTIONS: Section[] = [
  {
    id: 'docs',
    slug: 'docs',
    pages: [
      page('overlay', 'overlay'),
      page('binpkg', 'binpkg-setup'),
      page('binpkgSigning', 'binpkg-signing'),
      page('distfilesSetup', 'distfiles-setup'),
      page('gentooRepoSetup', 'gentoo-repo-setup'),
      page('gentooDistfilesSetup', 'gentoo-distfiles-setup'),
      page('gentooBinpkgSetup', 'gentoo-binpkg-setup'),
      page('gentooPrefixSetup', 'gentoo-prefix-setup'),
    ],
  },
  {
    id: 'download',
    slug: 'download',
    pages: [
      page('liveIso', 'iso', {anchor: 'live-iso'}),
      page('officialMedia', 'official-media'),
      page('mirrorlist', 'mirrorlist', {anchor: {'zh-cn': '镜像源', 'zh-tw': '鏡像源', en: 'mirrors'}}),
      page('gentooMirrors', 'gentoo-mirrors'),
      page('packages', 'packages'),
      page('files', 'files'),
    ],
  },
  {
    id: 'community',
    slug: 'community',
    pages: [
      {id: 'posts', kind: 'route', href: routes.posts},
      {id: 'tags', kind: 'route', href: routes.tags},
      page('changelog', 'changelog'),
      page('channels', 'channels'),
      page('contributors', 'contributors'),
      page('contributing', 'contributing'),
      page('overlayContributing', 'overlay-contributing'),
      page('websiteContributing', 'website-contributing'),
    ],
  },
  {
    id: 'support',
    slug: 'support',
    pages: [
      page('faq', 'faq'),
      page('overlayTroubleshooting', 'overlay-troubleshooting'),
      page('binpkgTroubleshooting', 'binpkg-troubleshooting'),
      page('distfilesTroubleshooting', 'distfiles-troubleshooting'),
      page('status', 'status'),
      page('paste', 'paste'),
      external('forum', () => SITE.forum),
    ],
  },
  {
    id: 'about',
    slug: 'about',
    landingPage: 'about',
    pages: [
      page('about', 'about'),
      page('costs', 'costs'),
      page('thanks', 'thanks'),
      page('logo', 'logo'),
    ],
  },
];

export function sectionHref(locale: Locale, section: Section): string {
  return routes.page(locale, section.slug);
}

export interface EntryLink {
  href: string;
  /** Leaves this site for an external service. */
  isExternal: boolean;
}

export function entryLink(locale: Locale, entry: SectionPage): EntryLink {
  return {
    href: entry.kind === 'page' ? routes.page(locale, entry.slug) : entry.href(locale),
    isExternal: entry.kind === 'external',
  };
}

export function entryAnchor(locale: Locale, entry: SectionPage): string | undefined {
  if (entry.kind !== 'page' || entry.anchor == null) return undefined;
  return typeof entry.anchor === 'string' ? entry.anchor : entry.anchor[locale];
}

export function menuEntries(locale: Locale, section: Section): Array<{entry: SectionPage; link: EntryLink}> {
  return section.pages.map(entry => ({entry, link: entryLink(locale, entry)}));
}

export function sectionOf(id: SectionId): Section {
  const section = SECTIONS.find(entry => entry.id === id);
  if (section == null) throw new Error(`unknown section ${id}`);
  return section;
}

export const SETUP_PAGE_GROUPS: ReadonlyArray<ReadonlyArray<SectionPageId>> = [
  ['overlay', 'binpkg', 'binpkgSigning', 'distfilesSetup'],
  ['gentooRepoSetup', 'gentooDistfilesSetup', 'gentooBinpkgSetup', 'gentooPrefixSetup'],
];

/** External services shown in the site switcher. */
export type ServiceId = 'main' | 'forum' | 'distfiles' | 'paste' | 'status' | 'github';

export function services(locale: Locale): Array<{id: ServiceId; href: string}> {
  return [
    {id: 'main', href: routes.home(locale)},
    {id: 'forum', href: SITE.forum},
    {id: 'distfiles', href: routes.page(locale, 'files')},
    {id: 'paste', href: SITE.paste},
    {id: 'status', href: routes.page(locale, 'status')},
    {id: 'github', href: SITE.github},
  ];
}
