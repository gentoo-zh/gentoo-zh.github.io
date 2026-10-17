// Chevron treatment from the Astryx docsite link cards (MIT, Meta Platforms, Inc.).
import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {CARD, ICON, SPACE} from '../theme/scale';

const styles = stylex.create({
  // Fragment targets must clear the sticky header measured by HeaderOffset.astro.
  anchor: {scrollMarginTop: 'calc(var(--appshell-header-height, 0rem) + var(--spacing-4))'},
});

export interface LinkCardProps {
  /** Fragment id, for links that point at this card. */
  id?: string;
  title: string;
  sub: string;
  link: {href: string; isExternal: boolean};
  /** Decorative glyph before the title, such as a section/entryIcons glyph. */
  icon?: ReactNode;
}

function CardText({title, sub, icon}: {title: string; sub: string; icon?: ReactNode}) {
  const text = (
    <VStack gap={SPACE.toolbar}>
      <Text type="body" weight="medium">
        {title}
      </Text>
      <Text type="supporting" color="secondary">
        {sub}
      </Text>
    </VStack>
  );
  if (icon == null) return text;
  return (
    <HStack align="center" gap={SPACE.inline}>
      {icon}
      {text}
    </HStack>
  );
}

export function LinkCard({id, title, sub, link, icon}: LinkCardProps) {
  return (
    <ClickableCard id={id} href={link.href} label={title} padding={CARD.padding} variant="muted" xstyle={styles.anchor}>
      <HStack justify="between" align="center" gap={SPACE.tight}>
        <CardText title={title} sub={sub} icon={icon} />
        <Icon icon={link.isExternal ? 'externalLink' : 'chevronRight'} size={ICON.inline} color="secondary" />
      </HStack>
    </ClickableCard>
  );
}
