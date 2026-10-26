// A post read in pages (front matter `paged`): the page list in the sidebar or, on phones, above the body.
// Plain links throughout; nothing hydrates.
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import type {Locale} from '../../i18n/locales';
import {chapterRoute} from '../../i18n/routes';
import {useMessage} from '../../i18n/useMessage';
import type {PageGroup} from '../../markdown/chapters';
import {DisclosureSummary} from '../../markdown/DisclosureSummary';
import {media, typography} from '../../theme/layout.stylex';
import {BUTTON} from '../../theme/scale';
import {SectionSideNav} from '../section/SectionSideNav';

// Group headings and their indented items take SectionNavGroups' weights and spacing, so the list reads
// like the FAQ sidebar. A SideNavItem with children always draws a collapse button, which needs an island,
// so the items follow their heading and take the nested list's indent themselves.
const styles = stylex.create({
  group: {paddingBlock: spacingVars['--spacing-2']},
  item: {paddingBlock: spacingVars['--spacing-0-5']},
  header: {'--font-weight-normal': typography.sidebarGroupWeight},
  child: {'--font-weight-normal': typography.sidebarItemWeight},
  firstChild: {paddingBlockStart: spacingVars['--spacing-1']},
  // The indent SideNavItem gives nested items, measured on the FAQ sidebar; the item gives up the full
  // width it takes by default, so its end and its truncated label stay inside the sidebar.
  indent: {marginInlineStart: spacingVars['--spacing-6'], width: 'auto'},
  // Shown where SectionSideNav hides the sidebar (media.mobile).
  mobilePages: {
    display: {default: 'none', [media.mobile]: 'block'},
  },
  pageLinks: {maxHeight: '60dvh', overflowY: 'auto', paddingBlockStart: spacingVars['--spacing-3']},
});

// xstyle types admit no custom properties, though they reach the DOM unchanged.
const asXstyle = (style: object) => style as StyleXStyles;

export interface PageListProps {
  locale: Locale;
  slug: string;
  /** The numbered pages under their groups (pageGroups). */
  groups: PageGroup[];
  /** The page shown: 0 for the overview, otherwise a section number. */
  current: number;
}

function PageItems({locale, slug, groups, current}: PageListProps) {
  const t = useMessage();
  const href = (number: number) => chapterRoute(locale, slug, number);
  const header = [styles.item, asXstyle(styles.header)];
  return (
    <>
      <SideNavSection title={t('gz.section.overview')} isHeaderHidden xstyle={styles.group}>
        <SideNavItem size={BUTTON.sidebar} xstyle={header} label={t('gz.section.overview')} href={href(0)} isSelected={current === 0} />
      </SideNavSection>
      {groups.map(({title, pages}) => {
        const items = pages.map((page, index) => (
          <SideNavItem
            key={page.number}
            size={BUTTON.sidebar}
            xstyle={title == null ? header : [styles.item, asXstyle(styles.child), styles.indent, index === 0 && styles.firstChild]}
            label={page.title ?? ''}
            href={href(page.number)}
            isSelected={page.number === current}
          />
        ));
        return (
          <SideNavSection key={pages[0].number} title={title ?? t('gz.post.chapters')} isHeaderHidden xstyle={styles.group}>
            {title == null ? null : <SideNavItem size={BUTTON.sidebar} xstyle={header} label={title} href={href(pages[0].number)} />}
            {items}
          </SideNavSection>
        );
      })}
    </>
  );
}

/** The pages in place of the category tree; Base passes it as `sideNav`. */
export function ChapterSideNav(props: PageListProps) {
  const t = useMessage();
  return (
    <SectionSideNav label={t('gz.post.chapters')}>
      <PageItems {...props} />
    </SectionSideNav>
  );
}

/** The page list where the sidebar is hidden, in the page header. */
export function MobileChapters(props: PageListProps) {
  const t = useMessage();
  return (
    <VStack as="details" xstyle={styles.mobilePages} data-pagefind-ignore>
      <DisclosureSummary label={t('gz.post.chapters')} />
      <VStack as="nav" aria-label={t('gz.post.chapters')} xstyle={styles.pageLinks}>
        <PageItems {...props} />
      </VStack>
    </VStack>
  );
}
