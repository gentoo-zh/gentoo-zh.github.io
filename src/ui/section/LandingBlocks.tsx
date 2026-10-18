import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';
import {useMessage} from '../../i18n/useMessage';
import {layout, media} from '../../theme/layout.stylex';
import {BUTTON, GRID, ICON, SPACE} from '../../theme/scale';
import type {EntryLink} from '../chrome/sections';
import {ArrowRight} from '../chrome/icons';
import {IconTile} from '../chrome/IconTile';

const styles = stylex.create({
  anchor: {scrollMarginTop: 'calc(var(--appshell-header-height, 0rem) + var(--spacing-4))'},
  grid: {gridTemplateColumns: {default: layout.landingColumns, [media.toc]: layout.landingTabletColumns, [media.mobile]: layout.landingPhoneColumns}},
  card: {minWidth: 0, height: '100%'},
  title: {minWidth: 0, flex: 1},
  marker: {flexShrink: 0},
  // Two reserved lines give every block on every landing the same height.
  description: {minHeight: '2lh'},
  // A row card centres its icon, text and marker on one line, like a List row, whatever the row height.
  row: {display: 'flex', flexDirection: 'column', justifyContent: 'center'},
  rowText: {minWidth: 0, flex: 1},
  // Direct links sit above the card's own link.
  links: {position: 'relative', zIndex: 1},
  // The direct-link marks take the description's grey.
  linkButton: {color: 'var(--color-text-secondary)'},
});

export interface LandingBlock {
  id: string;
  anchor?: string;
  title: string;
  description: string;
  icon: ReactNode;
  link: EntryLink;
  step?: string;
  /** Direct links shown in place of the description. */
  links?: {label: string; href: string; icon: ReactNode}[];
}

export function LandingBlocks({entries, id, label, itemXstyle}: {entries: LandingBlock[]; id?: string; label: string; itemXstyle?: stylex.StyleXStyles}) {
  return (
    <Grid id={id} columns={GRID.landingColumns} gap={SPACE.block} xstyle={[styles.anchor, styles.grid]} aria-label={label}>
      {entries.map(entry => <LandingCard key={entry.id} entry={entry} reveal={itemXstyle != null} xstyle={itemXstyle} />)}
    </Grid>
  );
}

/** One landing card; the home page places these in its own grids. */
export function LandingCard({entry, reveal, xstyle, accessibilityLevel = 2, isRow = false, badge}: {
  entry: LandingBlock;
  reveal?: boolean;
  xstyle?: stylex.StyleXStyles;
  accessibilityLevel?: 2 | 3 | 4;
  /** Lay the card out as one row: a large icon tile, the title over a one-line description, then the marker. */
  isRow?: boolean;
  /** A status indicator beside the title, before the marker. */
  badge?: ReactNode;
}) {
  const t = useMessage();
  const {anchor, title, description, icon, link, step, links} = entry;
  return (
    <ClickableCard
      id={anchor}
      data-home-reveal={reveal ? true : undefined}
      href={link.href}
      target={link.isExternal ? '_blank' : undefined}
      label={link.isExternal ? `${title} · ${t('gz.section.external')}` : title}
      padding={SPACE.block}
      xstyle={[styles.card, styles.anchor, isRow && styles.row, xstyle]}>
      {isRow ? (
        <HStack gap={SPACE.inline} vAlign="center">
          <IconTile isLarge>{icon}</IconTile>
          <VStack gap={SPACE.hairline} xstyle={styles.rowText}>
            <Heading level={3} accessibilityLevel={accessibilityLevel} maxLines={1}>{title}</Heading>
            <Text type="body" color="secondary" maxLines={2}>{description}</Text>
          </VStack>
          <Icon icon={link.isExternal ? 'externalLink' : ArrowRight} size={ICON.inline} color="secondary" xstyle={styles.marker} />
        </HStack>
      ) : (
      <VStack gap={SPACE.tight}>
        <HStack gap={SPACE.tight} align="center">
          <IconTile>{icon}</IconTile>
          <Heading level={3} accessibilityLevel={accessibilityLevel} maxLines={1} xstyle={styles.title}>{title}</Heading>
          <HStack gap={SPACE.hairline} align="center" xstyle={styles.marker}>
            {badge}
            {step ? <Text type="supporting" color="secondary" aria-label={`${t('gz.section.step')} ${step}`}>{step}</Text> : null}
            <Icon icon={link.isExternal ? 'externalLink' : ArrowRight} size={ICON.inline} color="secondary" />
          </HStack>
        </HStack>
        {links ? <HStack gap={SPACE.tight} wrap="wrap" align="center" xstyle={[styles.description, styles.links]}>
          {links.map(item => <Button key={item.href} label={item.label} tooltip={item.label} variant="ghost" size={BUTTON.inline} isIconOnly icon={item.icon} href={item.href} xstyle={styles.linkButton} />)}
        </HStack> : <Text type="body" color="secondary" maxLines={2} xstyle={styles.description}>{description}</Text>}
      </VStack>
      )}
    </ClickableCard>
  );
}
