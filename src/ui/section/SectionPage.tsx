// Adapted from Astryx DocPageLayout (components/docs/DocPageLayout.tsx, MIT, Meta Platforms, Inc.).
// Slot outline entries join Markdown headings in document order.
import * as stylex from '@stylexjs/stylex';
import {spacingVars, typeScaleVars} from '@astryxdesign/core/theme/tokens.stylex';
import {Fragment, type ReactNode} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack} from '@astryxdesign/core/Layout';
import {Section} from '@astryxdesign/core/Section';
import {Outline, type OutlineItem} from '@astryxdesign/core/Outline';
import {HStack} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {Text} from '@astryxdesign/core/Text';
import {PageHeader} from '../PageHeader';
import type {Locale} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {outlineItems} from '../../markdown/outline';
import {PostMarkdown, type PostMarkdownProps} from '../../markdown/PostMarkdown';
import {layout, media} from '../../theme/layout.stylex';
import {BUTTON, GRID, ICON, SPACE, TEMPLATE} from '../../theme/scale';
import css from '../../markdown/MarkdownBody.module.css';
import {SquarePen} from '../chrome/icons';
import {menuEntries, sectionHref, sectionOf, type SectionId} from '../chrome/sections';
import {useSectionPageContext} from './sectionContext';
import {LinkCard} from '../LinkCard';
import {pageStart} from './pageStart.stylex';

// Pad only the article below the navigation; sidebar and outline retain their sticky positions.
const ARTICLE_BODY = {
  color: 'var(--color-text-primary)',
  marginBlockStart: {
    default: spacingVars['--spacing-12'],
    [media.mobile]: `calc(${spacingVars['--spacing-12']} - (var(--appshell-header-height, ${spacingVars['--spacing-12']}) - ${spacingVars['--spacing-12']}))`,
  },
  [typeScaleVars['--text-body-size']]: 'var(--font-size-lg)',
  [typeScaleVars['--text-body-leading']]: '1.6470588235',
};

const styles = stylex.create({
  // Full-width pages start their title at the same height as every other page.
  dashboard: {width: '100%', minWidth: 0},
  anchor: {scrollMarginTop: 'calc(var(--appshell-header-height, 0rem) + var(--spacing-4))'},
  section: {
    marginInline: {default: 'auto', [media.tablet]: 0},
    width: '100%',
    minWidth: 0,
    ...ARTICLE_BODY,
  },
  sectionInRow: {
    marginInline: 0,
    width: '100%',
    flexShrink: 1,
    minWidth: 0,
    ...ARTICLE_BODY,
  },
  prose: {maxWidth: layout.proseMaxWidth, width: '100%'},
  titleDivider: {display: {default: 'block', [media.toc]: 'none'}},
  mobileOutline: {
    display: {default: 'none', [media.toc]: 'block'},
    position: 'sticky',
    top: 'var(--appshell-header-height, 0rem)',
    zIndex: 1,
    backgroundColor: 'var(--color-background-surface)',
    paddingBlock: spacingVars['--spacing-3'],
    borderBottomWidth: 'var(--border-width)',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
  },
  outlineSummary: {
    cursor: 'pointer',
    minHeight: 'var(--size-element-md)',
    paddingInline: spacingVars['--spacing-3'],
    borderWidth: 'var(--border-width)',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-element)',
    listStyle: 'none',
    '::-webkit-details-marker': {display: 'none'},
  },
  outlineLinks: {maxHeight: '60dvh', overflowY: 'auto', paddingBlockStart: spacingVars['--spacing-3']},
  aside: {
    color: 'var(--color-text-primary)',
    display: {default: 'block', [media.toc]: 'none'},
    position: 'sticky',
    top: `calc(var(--appshell-header-height, 0rem) + ${spacingVars['--spacing-6']})`,
    alignSelf: 'flex-start',
    flexShrink: 0,
    width: layout.tocWidth,
    paddingBlockStart: spacingVars['--spacing-6'],
  },
});

export interface SectionPageProps {
  locale: Locale;
  /** Category used for navigation and page context. */
  section: SectionId;
  title: string;
  description?: string;
  headerNavigation?: ReactNode;
  /** Table-page data region; Markdown keeps the docsite prose measure. */
  isDataPage?: boolean;
  /** Wide data tables with sticky headers: no outline, so the tables get its width and nothing else sticks under the navbar. */
  isTablePage?: boolean;
  /** Status dashboard supplies its own template header and full-width data frame. */
  isFullWidthDataPage?: boolean;
  /** Markdown body, front matter removed. */
  body?: string;
  /** Components for the body's `<!-- slot:<name> -->` lines (`<!-- steps -->` is `steps`). */
  slots?: Readonly<Record<string, ReactNode | PageSlot>>;
  /** Outline entries for content in `children`, appended after the body's. */
  outline?: ReadonlyArray<OutlineItem>;
  /** Components appended after the Markdown body; use slots for inline placement. */
  children?: ReactNode;
  /** Post paths that exist in this locale, for links into posts. */
  pages: ReadonlySet<string>;
  /** Passed to the body's Markdown; see PostMarkdown. */
  renderInlineCode?: PostMarkdownProps['renderInlineCode'];
}

/** A slot's content and the outline entries it adds, such as one per Stepper step. */
export interface PageSlot {
  node: ReactNode;
  outline?: ReadonlyArray<OutlineItem>;
}

/** `<!-- slot:name -->` or the short `<!-- steps -->`, alone on its line. */
const SLOT_LINE = /^<!-- (?:slot:)?([a-z]+) -->$/m;
const SLOT_SPLIT = new RegExp(SLOT_LINE.source, 'gm');

function isPageSlot(value: ReactNode | PageSlot): value is PageSlot {
  return value != null && typeof value === 'object' && 'node' in value && !('$$typeof' in value);
}

function bodyParts(title: string, body: string, slots: Readonly<Record<string, ReactNode | PageSlot>>) {
  return body.split(SLOT_SPLIT).map((part, index) => {
    if (index % 2 === 0) return {kind: 'markdown' as const, source: part};
    const slot = slots[part];
    if (slot === undefined) throw new Error(`${title}: unknown slot "${part}"`);
    return isPageSlot(slot) ? {kind: 'slot' as const, node: slot.node, outline: slot.outline ?? []} : {kind: 'slot' as const, node: slot, outline: []};
  });
}

export function SectionPage({locale, section, title, description, headerNavigation, body, slots = {}, outline: extra = [], isDataPage = false, isTablePage = false, isFullWidthDataPage = false, pages, renderInlineCode, children}: SectionPageProps) {
  const t = useMessage();
  const parts = body == null ? [] : bodyParts(title, body, slots);
  const outline = [...parts.flatMap(part => (part.kind === 'markdown' ? outlineItems(part.source) : part.outline)), ...extra];
  const hasOutline = outline.length > 0 && !isTablePage;
  const className = isFullWidthDataPage ? undefined : css.body;
  const article = (
    <Section maxWidth={isFullWidthDataPage ? undefined : isDataPage ? layout.contentMaxWidth : layout.proseMaxWidth} padding={isFullWidthDataPage ? TEMPLATE.zero : SPACE.page} xstyle={isFullWidthDataPage ? [styles.dashboard, pageStart.start] : hasOutline ? styles.sectionInRow : styles.section}>
      <VStack gap={SPACE.section} data-pagefind-body>
        {isFullWidthDataPage ? null : <VStack gap={SPACE.block} xstyle={styles.prose}>
          <PageHeader title={title} description={description} />
          {headerNavigation ?? <Divider xstyle={hasOutline ? styles.titleDivider : undefined} />}
        </VStack>
        }
        {hasOutline ? (
          <VStack as="details" xstyle={styles.mobileOutline} data-pagefind-ignore data-gz-outline>
            <HStack as="summary" align="center" justify="between" gap={SPACE.tight} xstyle={styles.outlineSummary}>
              <Text type="label">{t('gz.section.onThisPage')}</Text>
              <Icon icon="chevronDown" size={ICON.inline} color="secondary" />
            </HStack>
            <VStack xstyle={styles.outlineLinks}>
              <Outline items={outline} label={t('gz.section.onThisPage')} density="compact" />
            </VStack>
          </VStack>
        ) : null}
        <VStack gap={SPACE.section} className={className}>
          {parts.length === 0 ? null : (
            // Slots sit in the article flow, so they keep the Markdown block gap (16px) to the prose around them.
            <VStack gap={SPACE.block}>
          {parts.map((part, index) =>
            part.kind === 'slot' ? (
              <VStack key={index}>{part.node}</VStack>
            ) : part.source.trim() === '' ? null : (
              <VStack key={index} xstyle={styles.prose}>
                <MarkdownBlock locale={locale} pages={pages} renderInlineCode={renderInlineCode}>{part.source}</MarkdownBlock>
              </VStack>
            ),
          )}
            </VStack>
          )}
          {children}
        </VStack>
        {isFullWidthDataPage ? <VStack padding={SPACE.page}><PageFooter locale={locale} section={section} /></VStack> : <PageFooter locale={locale} section={section} />}
      </VStack>
    </Section>
  );
  // Data pages keep the rail like the docs; only a full-width dashboard drops it.
  if (!hasOutline || isFullWidthDataPage) return article;
  return (
    <HStack gap={SPACE.group} vAlign="start" hAlign="center" width="100%">
      {article}
      <VStack xstyle={styles.aside} data-pagefind-ignore data-gz-outline>
        <Outline items={outline} label={t('gz.section.onThisPage')} density="compact" />
      </VStack>
    </HStack>
  );
}

/** Adjacent pages follow sidebar order, with the overview first and external entries skipped. */
function PageFooter({locale, section}: {locale: Locale; section: SectionId}) {
  const t = useMessage();
  const context = useSectionPageContext();
  if (context == null) return null;
  const entry = sectionOf(section);
  const sequence = [
    ...(entry.landingPage == null ? [{id: 'landing', label: t('gz.section.overview'), href: sectionHref(locale, entry)}] : []),
    ...menuEntries(locale, entry)
      .filter(({link}) => !link.isExternal)
      .map(({entry: page, link}) => ({id: page.id as string, label: t(`gz.nav.${page.id}`), href: link.href})),
  ];
  const index = sequence.findIndex(item => item.id === context.current);
  const prev = index > 0 ? sequence[index - 1] : undefined;
  const next = index >= 0 && index < sequence.length - 1 ? sequence[index + 1] : undefined;
  return (
    <VStack gap={SPACE.block} data-pagefind-ignore>
      {context.editHref == null ? null : (
        <HStack>
          <Button
            variant="secondary"
            size={BUTTON.cta}
            label={t('gz.section.edit')}
            href={context.editHref}
            target="_blank"
            rel="noopener noreferrer"
            icon={<SquarePen size={ICON.inlinePx} />}
          />
        </HStack>
      )}
      {prev == null && next == null ? null : (
        <>
          <Divider />
          <Grid columns={{minWidth: GRID.card, repeat: 'fit'}} gap={SPACE.inline} role="navigation" aria-label={t(`gz.nav.${section}`)}>
            {prev == null ? null : (
              <LinkCard title={prev.label} sub={t('gz.section.prev')} link={{href: prev.href, isExternal: false}} />
            )}
            {next == null ? null : (
              <LinkCard title={next.label} sub={t('gz.section.next')} link={{href: next.href, isExternal: false}} />
            )}
          </Grid>
        </>
      )}
    </VStack>
  );
}

/** Render page fragments with the same Markdown contracts as posts. */
export function MarkdownBlock({locale, pages, renderInlineCode, children}: {locale: Locale; pages: ReadonlySet<string>; renderInlineCode?: PostMarkdownProps['renderInlineCode']; children: string}) {
  return (
    <VStack>
      {children.split(/^<!-- anchor:([^\s<>]+) -->$/m).map((part, index) => (
        <Fragment key={index}>
          {index % 2 === 1 ? <VStack id={part} aria-hidden="true" xstyle={styles.anchor} /> : part.trim() === '' ? null : (
            <PostMarkdown locale={locale} pages={pages} renderInlineCode={renderInlineCode}>{part}</PostMarkdown>
          )}
        </Fragment>
      ))}
    </VStack>
  );
}
