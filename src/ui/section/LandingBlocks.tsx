import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Heading, Text} from '@astryxdesign/core/Text';
import {useMessage} from '../../i18n/useMessage';
import {layout, media} from '../../theme/layout.stylex';
import {GRID, ICON, SPACE} from '../../theme/scale';
import type {EntryLink} from '../chrome/sections';
import {ArrowRight} from '../chrome/icons';

const styles = stylex.create({
  anchor: {scrollMarginTop: 'calc(var(--appshell-header-height, 0rem) + var(--spacing-4))'},
  grid: {gridTemplateColumns: {default: layout.landingColumns, [media.toc]: layout.landingTabletColumns, [media.mobile]: layout.landingPhoneColumns}},
  card: {minWidth: 0, height: '100%'},
  title: {minWidth: 0, flex: 1},
  mark: {color: 'var(--color-icon-primary)', flexShrink: 0},
  marker: {flexShrink: 0},
  // Two reserved lines give every block on every landing the same height.
  description: {fontSize: 'var(--font-size-base)', lineHeight: 'var(--text-label-leading)', minHeight: '2lh'},
  // Direct links sit above the card's own link.
  links: {position: 'relative', zIndex: 1},
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
  const t = useMessage();
  return (
    <Grid id={id} columns={GRID.landingColumns} gap={SPACE.block} xstyle={[styles.anchor, styles.grid]} aria-label={label}>
      {entries.map(({id: key, anchor, title, description, icon, link, step, links}) => (
        <ClickableCard
          key={key}
          id={anchor}
          data-home-reveal={itemXstyle ? true : undefined}
          href={link.href}
          target={link.isExternal ? '_blank' : undefined}
          label={link.isExternal ? `${title} · ${t('gz.section.external')}` : title}
          padding={SPACE.block}
          xstyle={[styles.card, styles.anchor, itemXstyle]}>
          <VStack gap={SPACE.tight}>
            <HStack gap={SPACE.tight} align="center">
              <HStack gap={SPACE.hairline} align="center" xstyle={styles.mark}>{icon}</HStack>
              <Heading level={3} accessibilityLevel={2} maxLines={1} xstyle={styles.title}>{title}</Heading>
              <HStack gap={SPACE.hairline} align="center" xstyle={styles.marker}>
                {step ? <Text type="supporting" color="secondary" aria-label={`${t('gz.section.step')} ${step}`}>{step}</Text> : null}
                <Icon icon={link.isExternal ? 'externalLink' : ArrowRight} size={ICON.inline} color="secondary" />
              </HStack>
            </HStack>
            {links ? <HStack gap={SPACE.block} wrap="wrap" align="start" xstyle={[styles.description, styles.links]}>
              {links.map(item => <Link key={item.href} href={item.href} color="secondary"><HStack gap={SPACE.hairline} align="center">{item.icon}{item.label}</HStack></Link>)}
            </HStack> : <Text color="secondary" maxLines={2} xstyle={styles.description}>{description}</Text>}
          </VStack>
        </ClickableCard>
      ))}
    </Grid>
  );
}
