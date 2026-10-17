import type {AnchorHTMLAttributes} from 'react';
import {HStack} from '@astryxdesign/core/Layout';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import type {Locale} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {entryLink, type SectionPage, type SectionPageId} from '../chrome/sections';

// Static navigation has no roving-tabindex handler, so every link stays keyboard reachable.
function StaticTabLink({children, ...props}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <HStack as="a" {...props} tabIndex={0}>{children}</HStack>;
}

export function GuideGroupTabs({locale, current, pages}: {locale: Locale; current: SectionPageId; pages: ReadonlyArray<SectionPage>}) {
  const t = useMessage();
  return (
    <TabList value={current} onChange={() => {}} overflow="scroll" hasDivider aria-label={t('gz.nav.docs')} data-gz-guide-tabs>
      {pages.map(page => <Tab key={page.id} value={page.id} label={t(`gz.nav.${page.id}`)} href={entryLink(locale, page).href} as={StaticTabLink} />)}
    </TabList>
  );
}
