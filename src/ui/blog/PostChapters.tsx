// A post read in pages (front matter `paged`): the frames around its page list, in the sidebar or, on
// phones, above the body. The list itself is the `chapters` island (ChapterNavGroups, renderChapterNav).
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {useMessage} from '../../i18n/useMessage';
import {DisclosureSummary} from '../../markdown/DisclosureSummary';
import {media} from '../../theme/layout.stylex';
import {SectionSideNav} from '../section/SectionSideNav';

const styles = stylex.create({
  // Shown where SectionSideNav hides the sidebar (media.mobile).
  mobilePages: {
    display: {default: 'none', [media.mobile]: 'block'},
  },
  pageLinks: {maxHeight: '60dvh', overflowY: 'auto', paddingBlockStart: spacingVars['--spacing-3']},
});

/** The pages in place of the category tree; Base passes it as `sideNav`. */
export function ChapterSideNav({children}: {children: ReactNode}) {
  const t = useMessage();
  return <SectionSideNav label={t('gz.post.chapters')}>{children}</SectionSideNav>;
}

/** The page list where the sidebar is hidden, in the page header. */
export function MobileChapters({children}: {children: ReactNode}) {
  const t = useMessage();
  return (
    <VStack as="details" xstyle={styles.mobilePages} data-pagefind-ignore>
      <DisclosureSummary label={t('gz.post.chapters')} />
      <VStack as="nav" aria-label={t('gz.post.chapters')} xstyle={styles.pageLinks}>
        {children}
      </VStack>
    </VStack>
  );
}
