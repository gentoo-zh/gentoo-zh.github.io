import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import type {AnchorHTMLAttributes} from 'react';
import {HStack} from '@astryxdesign/core/Layout';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import type {Locale} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {media} from '../../theme/layout.stylex';
import {entryLink, type SectionPage, type SectionPageId} from '../chrome/sections';

const styles = stylex.create({
  // Phones fit more of the strip with tighter tabs; the size prop only sets the tab height. The default
  // restates Tab's own padding, which this key replaces.
  tab: {paddingInline: {default: spacingVars['--spacing-3'], [media.mobile]: spacingVars['--spacing-2']}},
});

// Static navigation has no roving-tabindex handler, so every link stays keyboard reachable.
function StaticTabLink({children, ...props}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <HStack as="a" {...props} tabIndex={0}>{children}</HStack>;
}

export function GuideGroupTabs({locale, current, pages}: {locale: Locale; current: SectionPageId; pages: ReadonlyArray<SectionPage>}) {
  const t = useMessage();
  return (
    <TabList value={current} onChange={() => {}} overflow="scroll" hasDivider aria-label={t('gz.nav.docs')} data-gz-guide-tabs>
      {pages.map(page => <Tab key={page.id} value={page.id} label={t(`gz.nav.${page.id}`)} href={entryLink(locale, page).href} as={StaticTabLink} xstyle={styles.tab} />)}
    </TabList>
  );
}
