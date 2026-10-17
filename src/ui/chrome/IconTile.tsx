// After the Astryx docsite community page iconTile (MIT), tinted with the theme accent.
// Copyright (c) Meta Platforms, Inc. and affiliates.
import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';
import {HStack} from '@astryxdesign/core/Layout';
import {spacingVars as space} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  // One rounded square, one glyph size, the accent at rest.
  tile: {flexShrink: 0, width: space['--spacing-9'], height: space['--spacing-9'], borderRadius: 'var(--radius-inner)', backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-brand)'},
  // The large tile heads a row card whose title and description stack beside it.
  large: {width: space['--spacing-12'], height: space['--spacing-12']},
});

/** The tile behind the glyph that heads a row or card: Lucide outlines and brand marks alike, at `ICON.toolbarPx`. */
export function IconTile({children, isLarge = false}: {children: ReactNode; isLarge?: boolean}) {
  return <HStack hAlign="center" vAlign="center" xstyle={[styles.tile, isLarge && styles.large]}>{children}</HStack>;
}
