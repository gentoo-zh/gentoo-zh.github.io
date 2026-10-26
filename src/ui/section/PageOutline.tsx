// Adapted from Astryx DocPageLayout (components/docs/DocPageLayout.tsx, MIT, Meta Platforms, Inc.).
// The "On this page" outline that section pages and posts share: a sticky rail beside the article on
// wide screens, a collapsible block above the body below `media.toc`. OutlineSpy marks the entry in view.
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import type {ReactNode} from 'react';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Outline, type OutlineItem} from '@astryxdesign/core/Outline';
import {Text} from '@astryxdesign/core/Text';
import {useMessage} from '../../i18n/useMessage';
import {layout, media} from '../../theme/layout.stylex';
import {ICON, SPACE} from '../../theme/scale';

const styles = stylex.create({
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
    // A long outline scrolls inside the rail instead of running past the viewport.
    maxHeight: `calc(100dvh - var(--appshell-header-height, 0rem) - 2 * ${spacingVars['--spacing-6']})`,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    // The sidebar's scroller (SectionSideNav): a thin bar that shows on hover or focus.
    scrollbarWidth: 'thin',
    scrollbarColor: {
      default: 'transparent transparent',
      ':hover': 'var(--color-border-emphasized) transparent',
      ':focus-within': 'var(--color-border-emphasized) transparent',
    },
  },
});

/** The collapsible outline shown above the body below `media.toc`. */
export function MobileOutline({items}: {items: OutlineItem[]}) {
  const t = useMessage();
  return (
    <VStack as="details" xstyle={styles.mobileOutline} data-pagefind-ignore data-gz-outline>
      <HStack as="summary" align="center" justify="between" gap={SPACE.tight} xstyle={styles.outlineSummary}>
        <Text type="label">{t('gz.section.onThisPage')}</Text>
        <Icon icon="chevronDown" size={ICON.inline} color="secondary" />
      </HStack>
      <VStack xstyle={styles.outlineLinks}>
        <Outline items={items} label={t('gz.section.onThisPage')} density="compact" />
      </VStack>
    </VStack>
  );
}

/** The article with the outline rail beside it; the article should shrink in the row (`flexShrink: 1`, `minWidth: 0`). */
export function OutlineRow({items, children}: {items: OutlineItem[]; children: ReactNode}) {
  const t = useMessage();
  return (
    <HStack gap={SPACE.group} vAlign="start" hAlign="center" width="100%">
      {children}
      <VStack xstyle={styles.aside} data-pagefind-ignore data-gz-outline>
        <Outline items={items} label={t('gz.section.onThisPage')} density="compact" />
      </VStack>
    </HStack>
  );
}
