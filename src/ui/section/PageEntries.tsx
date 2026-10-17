import type {Locale} from '../../i18n/locales';
import {routes} from '../../i18n/routes';
import {useMessage} from '../../i18n/useMessage';
import type {SectionPageId} from '../chrome/sections';
import {EntryIcon} from './entryIcons';
import {LandingBlocks} from './LandingBlocks';

type Entry = {
  id: SectionPageId;
  slug: string;
} | {id: 'wikiTranslation'; href: string; icon: SectionPageId};

export const CONTRIBUTION_ENTRIES: Entry[] = [
  {id: 'overlayContributing', slug: 'overlay-contributing'},
  {id: 'websiteContributing', slug: 'website-contributing'},
  {id: 'wikiTranslation', href: 'https://gentoozh.org/posts/2026-06-30-gentoo-wiki-translation/', icon: 'posts'},
  {id: 'channels', slug: 'channels'},
];

export function PageEntries({locale, entries, title}: {locale: Locale; entries: Entry[]; title: string}) {
  const t = useMessage();
  return (
    <LandingBlocks label={title} entries={entries.map(entry => ({
      id: entry.id,
      title: t(`gz.nav.${entry.id}`),
      description: t(`gz.section.sub.${entry.id}`),
      icon: <EntryIcon id={'icon' in entry ? entry.icon : entry.id} />,
      link: {href: 'href' in entry ? entry.href : routes.page(locale, entry.slug), isExternal: 'href' in entry},
    }))} />
  );
}
