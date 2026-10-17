// Ported from facebook/astryx apps/docsite/src/app/(site)/page.tsx and _landing (MIT).
// Copyright (c) Meta Platforms, Inc. and affiliates.
import * as stylex from '@stylexjs/stylex';
import {spacingVars as space} from '@astryxdesign/core/theme/tokens.stylex';
import {homeLayout as m, layout, media} from '../../theme/layout.stylex';

const CARD = 'var(--color-home-card)';

/** One wall period (14 tiles of size + gap) in both directions. */
const wallShift = stylex.keyframes({from: {translate: '0 0'}, to: {translate: 'calc(-14 * (var(--home-wall-tile) + var(--home-wall-gap))) calc(-14 * (var(--home-wall-tile) + var(--home-wall-gap)))'}});

export const homeStyles = stylex.create({
  scope: {position: 'relative', isolation: 'isolate', width: '100%', minWidth: 0, backgroundColor: 'var(--color-background-body)', color: 'var(--color-text-primary)'},
  hero: {position: 'relative', minHeight: m.band, paddingBlock: {default: space['--spacing-8'], [media.desktop]: space['--spacing-12']}, paddingInline: space['--spacing-6'], justifyContent: 'center', gap: {default: space['--spacing-8'], [media.desktop]: space['--spacing-12']}, overflow: 'clip'},
  // The logo file has a small transparent eye; the second mask layer (an ellipse) fills it.
  logoWall: {position: 'absolute', inset: 0, overflow: 'hidden', maskImage: 'url(/brand/gentoo-zh-icon-transparent.svg), radial-gradient(ellipse 9% 5% at 51% 37%, black 98%, transparent 100%)', maskSize: 'contain, 100% 100%', maskRepeat: 'no-repeat', maskPosition: 'center', containerType: 'size', '--home-wall-tile': '9cqw', '--home-wall-gap': 'calc(var(--spacing-1) / 2)'},
  wallTrack: {gridTemplateColumns: 'repeat(26, var(--home-wall-tile))', gap: 'var(--home-wall-gap)', width: 'max-content', animationName: {default: 'none', '@media (prefers-reduced-motion: no-preference)': wallShift}, animationDuration: '100s', animationTimingFunction: 'linear', animationIterationCount: 'infinite'},
  wallTile: {display: 'block', backgroundColor: 'var(--color-home-card)', width: 'var(--home-wall-tile)', height: 'var(--home-wall-tile)', objectFit: 'cover', borderRadius: 0},
  heroColumns: {position: 'relative', zIndex: 1, width: '100%', maxWidth: layout.contentMaxWidth, marginInline: 'auto', gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: m.heroGrid}, justifyContent: 'center', alignItems: 'center', gap: {default: space['--spacing-6'], [media.desktop]: `calc(${space['--spacing-12']} * 2)`}},
  // Stacked below desktop, so everything centres on the mark; side by side on desktop, the text aligns left.
  heroText: {position: 'relative', zIndex: 1, minWidth: 0, width: '100%', alignItems: {default: 'center', [media.desktop]: 'flex-start'}, textAlign: {default: 'center', [media.desktop]: 'start'}},
  // The mark's mass sits left of its box; shift it so it reads centred.
  artwork: {translate: '4% 0', position: 'relative', isolation: 'isolate', width: {default: '100%', [media.desktop]: m.mark}, maxWidth: {default: m.markCompact, [media.tablet]: m.markTablet, [media.desktop]: m.mark}, aspectRatio: '1', marginInline: 'auto', gridRow: {default: '1', [media.desktop]: 'auto'}, alignItems: 'center', justifyContent: 'center'},
  contributors: {display: {default: 'flex', [media.desktop]: 'none'}, position: 'relative', justifyContent: 'center', width: '100%', maxWidth: layout.contentMaxWidth, marginInline: 'auto', paddingBlock: space['--spacing-2']},
  metrics: {width: '100%', paddingBlockStart: space['--spacing-4'], justifyContent: {default: 'center', [media.desktop]: 'flex-start'}},
  brandLine: {display: 'block', color: 'var(--color-brand)'},
  headline: {fontWeight: 'var(--font-weight-normal)', fontSize: {default: 'var(--font-size-3xl)', [media.tablet]: 'var(--font-size-4xl)', [media.desktop]: m.headline}, lineHeight: 1.25},
  buttons: {width: '100%', maxWidth: layout.heroButtonsMaxWidth, marginInline: {default: 'auto', [media.desktop]: 0}},
  button: {borderRadius: 'var(--radius-full)'},
  sheet: {paddingBlockStart: space['--spacing-12'], paddingBlockEnd: {default: space['--spacing-12'], [media.desktop]: m.sectionGap}, paddingInline: space['--spacing-6'], gap: {default: space['--spacing-12'], [media.desktop]: m.sectionGap}},
  brandInk: {color: 'var(--color-brand)'},
  section: {width: '100%', maxWidth: layout.contentMaxWidth, marginInline: 'auto', minWidth: 0},
  sectionTitle: {fontSize: m.sectionHeading, lineHeight: 1.2, fontWeight: 'var(--font-weight-semibold)'},
  card: {height: '100%', width: '100%', backgroundColor: CARD, borderWidth: 0},
  features: {gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: 'repeat(2, minmax(0, 1fr))'}, columnGap: space['--spacing-12'], alignItems: 'start'},
  group: {padding: space['--spacing-6'], borderRadius: 'var(--radius-container)', backgroundColor: 'var(--color-home-card)'},
  groupTitle: {color: 'var(--color-brand)', fontSize: 'var(--text-supporting-size)', fontWeight: 'var(--font-weight-semibold)', paddingInline: space['--spacing-3']},
  postDate: {marginBlockStart: 'auto', paddingBlockStart: space['--spacing-2']},
  fill: {height: '100%', width: '100%', minWidth: 0},
  about: {display: 'grid', gap: space['--spacing-8'], alignItems: 'center', gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: 'minmax(0, 1fr) minmax(0, 2fr)'}},
  channels: {display: 'grid', gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: 'repeat(2, minmax(0, 1fr))'}, columnGap: space['--spacing-6']},
  // Two columns: the first item of the last row needs no divider either.
  lastRowStart: {borderBottomWidth: {default: null, [media.desktop]: 0}},
  aboutHeading: {textAlign: {default: 'center', [media.desktop]: 'start'}, alignItems: {default: 'center', [media.desktop]: 'flex-start'}},
  posts: {gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: 'repeat(3, minmax(0, 1fr))'}, alignItems: 'stretch'},
  cover: {overflow: 'hidden', borderRadius: 'var(--radius-container)', backgroundColor: 'var(--color-background-body)'},
  image: {display: 'block', width: '100%', height: '100%', objectFit: 'cover'},
  excerpt: {display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'},
  logos: {gridTemplateColumns: {default: 'repeat(3, minmax(0, 1fr))', [media.tablet]: 'repeat(3, minmax(0, 1fr))', [media.desktop]: 'repeat(6, minmax(0, 1fr))'}},
  logoScale: (scale: number) => ({transform: `scale(${scale})`}),
  logoBox: {width: '100%', justifyContent: 'center', height: {default: 'calc(var(--size-element-lg) * 1.6)', [media.tablet]: 'calc(var(--size-element-lg) * 2.5)'}, padding: space['--spacing-4'], boxSizing: 'border-box'},
  logo: {width: '100%', height: '100%', objectFit: 'contain'},
});
