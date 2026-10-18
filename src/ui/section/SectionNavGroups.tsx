import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {Icon} from '@astryxdesign/core/Icon';
import {SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import type {Locale} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {ICON, BUTTON} from '../../theme/scale';
import {typography} from '../../theme/layout.stylex';
import {menuEntries, SECTIONS, sectionHref, type SectionId, type SectionPageId} from '../chrome/sections';
import {SECTION_GROUP_ATTRIBUTE} from './sectionNavMarks';

export interface SectionSideNavProps {
  locale: Locale;
  section: SectionId;
  /** The page shown, or 'landing' for the category's own page. */
  current: SectionPageId | 'landing';
}

const styles = stylex.create({
  group: {paddingBlock: 'var(--spacing-2)'},
  item: {paddingBlock: 'var(--spacing-0-5)'},
  // SideNavItem reads weight from an inner row; set its inherited variable and reset children.
  header: {'--font-weight-normal': typography.sidebarGroupWeight},
  child: {'--font-weight-normal': typography.sidebarItemWeight},
  // The shared wrapper gives the first child half a gap; double it to match sibling spacing.
  firstChild: {paddingBlockStart: 'var(--spacing-1)'},
});

// xstyle types admit no custom properties, though they reach the DOM unchanged.
const asXstyle = (style: object) => style as StyleXStyles;

export function SectionNavGroups({locale, section, current}: SectionSideNavProps) {
  const t = useMessage();
  const [collapsed, setCollapsed] = useState<Partial<Record<SectionId, boolean>>>({});
  const toggle = (id: SectionId) => setCollapsed(previous => ({...previous, [id]: !(previous[id] ?? id !== section)}));
  return (
    <>
      {SECTIONS.map(entry => (
        <SideNavSection key={entry.id} title={t(`gz.nav.${entry.id}`)} isHeaderHidden xstyle={styles.group}>
          <SideNavItem
            size={BUTTON.sidebar}
            xstyle={[styles.item, asXstyle(styles.header)]}
            label={t(`gz.nav.${entry.id}`)}
            href={sectionHref(locale, entry)}
            {...{[SECTION_GROUP_ATTRIBUTE]: entry.id}}
            collapsible={{
              isCollapsed: collapsed[entry.id] ?? entry.id !== section,
              onCollapsedChange: value => setCollapsed(previous => ({...previous, [entry.id]: value})),
            }}
            onClick={event => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              toggle(entry.id);
            }}
          >
            {entry.landingPage == null ? <SideNavItem
              size={BUTTON.sidebar}
              xstyle={[styles.item, asXstyle(styles.child), styles.firstChild]}
              label={t('gz.section.overview')}
              href={sectionHref(locale, entry)}
              isSelected={section === entry.id && current === 'landing'}
            /> : null}
            {menuEntries(locale, entry).map(({entry: page, link}) => (
              <SideNavItem
                size={BUTTON.sidebar}
                xstyle={[styles.item, asXstyle(styles.child)]}
                key={page.id}
                label={t(`gz.nav.${page.id}`)}
                href={link.href}
                isSelected={section === entry.id && current === page.id}
                endContent={link.isExternal ? <Icon icon="externalLink" size={ICON.inline} color="secondary" /> : undefined}
              />
            ))}
          </SideNavItem>
        </SideNavSection>
      ))}
    </>
  );
}
