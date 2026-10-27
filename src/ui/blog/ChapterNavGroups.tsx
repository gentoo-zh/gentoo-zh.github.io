// A paged post's page list, folded like the docs sidebar (SectionNavGroups): a chapter with `###` sections
// is a collapsible item, and only the chapter shown starts open. Its first child links the chapter's own
// page, since a plain click on the header folds rather than follows it and the sections alone would skip
// the chapter's introduction. While the reader scrolls, the section being read is the one selected row.
import {useEffect, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import type {Locale} from '../../i18n/locales';
import {chapterRoute} from '../../i18n/routes';
import {useMessage} from '../../i18n/useMessage';
import type {PageSection} from '../../markdown/chapters';
import {typography} from '../../theme/layout.stylex';
import {BUTTON} from '../../theme/scale';
import {CHAPTER_ATTRIBUTE} from './chapterNavMarks';

// SectionNavGroups' weights and spacing. Chapters under a group heading take the nested list's indent
// themselves, since the heading is a plain link; their sections nest inside them as docs pages do.
const styles = stylex.create({
  group: {paddingBlock: spacingVars['--spacing-2']},
  item: {paddingBlock: spacingVars['--spacing-0-5']},
  header: {'--font-weight-normal': typography.sidebarGroupWeight},
  child: {'--font-weight-normal': typography.sidebarItemWeight},
  firstChild: {paddingBlockStart: spacingVars['--spacing-1']},
  // The indent SideNavItem gives nested items; the item gives up the full width it takes by default, so
  // its end, its chevron and its selected background stay inside the sidebar.
  indent: {marginInlineStart: spacingVars['--spacing-6'], width: 'auto'},
});

// xstyle types admit no custom properties, though they reach the DOM unchanged.
const asXstyle = (style: object) => style as StyleXStyles;

/** A numbered page as the list shows it; the page's Markdown stays out of the island's props. */
export interface ChapterEntry {
  number: number;
  title?: string;
  sections: PageSection[];
  intro: boolean;
}

export interface ChapterGroup {
  /** Absent for the pages listed before the first group. */
  title?: string;
  pages: ChapterEntry[];
}

export interface PageListProps {
  locale: Locale;
  slug: string;
  /** The numbered pages under their groups (pageGroups). */
  groups: ChapterGroup[];
  /** The page shown: 0 for the overview, otherwise a section number. */
  current: number;
}

/**
 * The id of the last section whose heading has passed the top third of the viewport, as OutlineSpy marks
 * the outline; undefined above the first one and on the server.
 */
function useSectionInView(ids: readonly string[]): string | undefined {
  const [shown, setShown] = useState<string>();
  const key = ids.join(' ');
  useEffect(() => {
    if (key === '') return;
    const targets = key.split(' ').map(id => document.getElementById(id));
    let frame = 0;
    // Measured on every scroll, not on intersection changes: a jump can carry a heading past the line
    // without it ever crossing the observed band.
    const update = () => {
      frame = 0;
      let current: string | undefined;
      for (const target of targets) if (target != null && target.getBoundingClientRect().top < innerHeight / 3) current = target.id;
      setShown(current);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', schedule, {passive: true});
    addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
    };
  }, [key]);
  return shown;
}

/** Scrolls `scroller` the least that brings its selected row into view, as SidebarScrollScript does on load. */
function keepSelectedInView(scroller: HTMLElement) {
  const selected = scroller.querySelector('[aria-current="page"]');
  if (!scroller.clientHeight || selected == null) return;
  const bounds = scroller.getBoundingClientRect();
  const item = selected.getBoundingClientRect();
  if (item.top < bounds.top) scroller.scrollTop += item.top - bounds.top;
  else if (item.bottom > bounds.bottom) scroller.scrollTop += item.bottom - bounds.bottom;
}

export interface ChapterNavGroupsProps extends PageListProps {
  /** The element the list scrolls in, which follows the selected row; the client passes it. */
  scroller?: HTMLElement | null;
}

export function ChapterNavGroups({locale, slug, groups, current, scroller}: ChapterNavGroupsProps) {
  const t = useMessage();
  const href = (number: number) => chapterRoute(locale, slug, number);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const isCollapsed = (number: number) => collapsed[number] ?? number !== current;
  const shownPage = groups.flatMap(group => group.pages).find(page => page.number === current);
  // Above the first section the page's top is selected: its overview row, or the first section without one.
  const section = useSectionInView(shownPage?.sections.map(entry => entry.id) ?? []) ?? (shownPage?.intro === false ? shownPage.sections[0]?.id : undefined);
  useEffect(() => {
    if (scroller != null && section != null) keepSelectedInView(scroller);
  }, [scroller, section]);
  const header = [styles.item, asXstyle(styles.header)];

  const chapter = (page: ChapterEntry, grouped: boolean, first: boolean) => {
    const xstyle = grouped ? [styles.item, asXstyle(styles.child), styles.indent, first && styles.firstChild] : header;
    const isShown = page.number === current;
    if (page.sections.length === 0) {
      return <SideNavItem key={page.number} size={BUTTON.sidebar} xstyle={xstyle} label={page.title ?? ''} href={href(page.number)} isSelected={isShown} />;
    }
    return (
      <SideNavItem
        key={page.number}
        size={BUTTON.sidebar}
        xstyle={xstyle}
        label={page.title ?? ''}
        href={href(page.number)}
        {...{[CHAPTER_ATTRIBUTE]: page.number}}
        collapsible={{
          isCollapsed: isCollapsed(page.number),
          onCollapsedChange: value => setCollapsed(previous => ({...previous, [page.number]: value})),
        }}
        onClick={event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          setCollapsed(previous => ({...previous, [page.number]: !(previous[page.number] ?? page.number !== current)}));
        }}
      >
        {page.intro ? <SideNavItem
          size={BUTTON.sidebar}
          xstyle={[styles.item, asXstyle(styles.child), styles.firstChild]}
          label={t('gz.post.chapterIntro')}
          href={href(page.number)}
          isSelected={isShown && section == null}
        /> : null}
        {page.sections.map((entry, at) => (
          <SideNavItem
            key={entry.id}
            size={BUTTON.sidebar}
            xstyle={[styles.item, asXstyle(styles.child), !page.intro && at === 0 && styles.firstChild]}
            label={entry.label}
            href={`${isShown ? '' : href(page.number)}#${entry.id}`}
            isSelected={isShown && section === entry.id}
          />
        ))}
      </SideNavItem>
    );
  };

  return (
    <>
      <SideNavSection title={t('gz.section.overview')} isHeaderHidden xstyle={styles.group}>
        <SideNavItem size={BUTTON.sidebar} xstyle={header} label={t('gz.section.overview')} href={href(0)} isSelected={current === 0} />
      </SideNavSection>
      {groups.map(({title, pages}) => (
        <SideNavSection key={pages[0].number} title={title ?? t('gz.post.chapters')} isHeaderHidden xstyle={styles.group}>
          {title == null ? null : <SideNavItem size={BUTTON.sidebar} xstyle={header} label={title} href={href(pages[0].number)} />}
          {pages.map((page, index) => chapter(page, title != null, index === 0))}
        </SideNavSection>
      ))}
    </>
  );
}
