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
  // 26 x 26 tiles, each var(--home-wall-tile) square in the card colour with var(--home-wall-gap) after it.
  wallTrack: {position: 'relative', flexShrink: 0, width: 'calc(26 * var(--home-wall-tile) + 25 * var(--home-wall-gap))', height: 'calc(26 * var(--home-wall-tile) + 25 * var(--home-wall-gap))', backgroundImage: `conic-gradient(from 270deg at var(--home-wall-tile) var(--home-wall-tile), ${CARD} 25%, transparent 0)`, backgroundSize: 'calc(var(--home-wall-tile) + var(--home-wall-gap)) calc(var(--home-wall-tile) + var(--home-wall-gap))', animationName: {default: 'none', '@media (prefers-reduced-motion: no-preference)': wallShift}, animationDuration: '100s', animationTimingFunction: 'linear', animationIterationCount: 'infinite'},
  // One period of avatars (scripts/gen-home-images.mjs), repeated over the tiles; each breakpoint has its own mosaic.
  wallMosaic: (compact: string, tablet: string, desktop: string) => ({position: 'absolute', inset: 0, backgroundImage: {default: compact, [media.tablet]: tablet, [media.desktop]: desktop}, backgroundSize: 'calc(14 * (var(--home-wall-tile) + var(--home-wall-gap))) calc(14 * (var(--home-wall-tile) + var(--home-wall-gap)))'}),
  heroColumns: {position: 'relative', zIndex: 1, width: '100%', maxWidth: layout.contentMaxWidth, marginInline: 'auto', gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: m.heroGrid}, justifyContent: 'center', alignItems: 'center', gap: {default: space['--spacing-6'], [media.desktop]: `calc(${space['--spacing-12']} * 2)`}},
  // Stacked below desktop, so everything centres on the mark; side by side on desktop, the text aligns left.
  heroText: {position: 'relative', zIndex: 1, minWidth: 0, width: '100%', alignItems: {default: 'center', [media.desktop]: 'flex-start'}, textAlign: {default: 'center', [media.desktop]: 'start'}},
  // The mark's mass sits left of its box; shift it so it reads centred.
  artwork: {translate: '4% 0', position: 'relative', isolation: 'isolate', width: {default: '100%', [media.desktop]: m.mark}, maxWidth: {default: m.markCompact, [media.tablet]: m.markTablet, [media.desktop]: m.mark}, aspectRatio: '1', marginInline: 'auto', gridRow: {default: '1', [media.desktop]: 'auto'}, alignItems: 'center', justifyContent: 'center'},
  metrics: {width: '100%', paddingBlockStart: space['--spacing-4'], justifyContent: {default: 'center', [media.desktop]: 'flex-start'}},
  brandLine: {display: 'block', color: 'var(--color-brand)'},
  headline: {fontSize: {default: 'var(--font-size-3xl)', [media.tablet]: 'var(--font-size-4xl)', [media.desktop]: m.headline}, lineHeight: 1.25},
  buttons: {width: '100%', maxWidth: layout.heroButtonsMaxWidth, marginInline: {default: 'auto', [media.desktop]: 0}},
  button: {borderRadius: 'var(--radius-full)'},
  sheet: {paddingBlockStart: space['--spacing-12'], paddingBlockEnd: {default: space['--spacing-12'], [media.desktop]: m.sectionGap}, paddingInline: space['--spacing-6'], gap: {default: space['--spacing-12'], [media.desktop]: m.sectionGap}},
  brandInk: {color: 'var(--color-brand)'},
  section: {width: '100%', maxWidth: layout.contentMaxWidth, marginInline: 'auto', minWidth: 0},
  card: {height: '100%', width: '100%', backgroundColor: CARD, borderWidth: 0},
  // Post covers are transparent; their frame takes the card colour.
  cover: {backgroundColor: CARD},
  // The status badge's script-toggled slots keep their display until the `hidden` attribute applies.
  toggle: {display: {default: 'inline-flex', ':is([hidden])': 'none'}},
  // A group's three rows: one row of three columns from the desktop breakpoint, so no divider runs under them.
  serviceRows: {display: 'grid', gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: 'repeat(3, minmax(0, 1fr))'}, columnGap: space['--spacing-6']},
  // Stacked rows keep List's divider except under the last one; the desktop row has none.
  oneRow: {borderBottomWidth: {default: 'var(--border-width)', ':last-child': 0, [media.desktop]: 0}},
  // The secondary panel: three groups stacked, then side by side from the desktop breakpoint. Each column spans the
  // label row and three entry rows as a subgrid, so labels share one top line and rows align across columns whatever
  // their text length. Gaps stay zero inside the subgrid; the label's own padding spaces it from the rows.
  groupColumns: {gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: 'repeat(3, minmax(0, 1fr))'}, columnGap: space['--spacing-6'], rowGap: {default: space['--spacing-6'], [media.desktop]: 0}},
  groupColumn: {display: {default: 'flex', [media.desktop]: 'grid'}, gridRow: {default: 'auto', [media.desktop]: 'span 4'}, gridTemplateRows: {default: 'none', [media.desktop]: 'subgrid'}, minWidth: 0},
  columnLabel: {paddingBlockEnd: space['--spacing-2']},
  columnRows: {display: {default: 'flex', [media.desktop]: 'grid'}, gridTemplateColumns: {default: 'none', [media.desktop]: 'minmax(0, 1fr)'}, gridRow: {default: 'auto', [media.desktop]: 'span 3'}, gridTemplateRows: {default: 'none', [media.desktop]: 'subgrid'}},
  group: {padding: space['--spacing-6'], borderRadius: 'var(--radius-container)', backgroundColor: 'var(--color-home-card)'},
  // The group label and a small ghost action share one baseline.
  groupHeader: {alignItems: 'baseline'},
  // Aligns the label with the list rows' inset.
  groupLabelInset: {paddingInline: space['--spacing-3']},
  // Transparent avatars sit on an opaque neutral disc; the ring takes the page colour so overlaps cut clean, and a
  // hairline just inside the ring (an outline paints over the image) keeps white-backed avatars from melting into the page.
  // The +N count stays a circle the size of the avatars: no inline padding, the supporting text size so +201 fits.
  overflowCount: {aspectRatio: '1', paddingInline: 0, minWidth: 0, fontSize: 'var(--text-supporting-size)'},
  avatar: {borderColor: 'var(--color-background-body)', backgroundColor: 'var(--color-background-body)', backgroundImage: 'linear-gradient(var(--color-neutral), var(--color-neutral))', color: 'var(--color-text-secondary)', outlineWidth: 1, outlineStyle: 'solid', outlineColor: 'var(--color-border)', outlineOffset: -3},
  // List clips inline overflow, so a row's focus ring sits inside the row or loses its sides.
  row: {outlineOffset: -2},
  // A group's own action stays as light as its title: supporting size, secondary ink.
  groupAction: {fontSize: 'var(--text-supporting-size)', color: 'var(--color-text-secondary)'},
  about: {display: 'grid', gap: space['--spacing-8'], alignItems: 'center', gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: 'minmax(0, 1fr) minmax(0, 2fr)'}},
  channels: {display: 'grid', gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: 'repeat(2, minmax(0, 1fr))'}, gridAutoRows: '1fr', columnGap: space['--spacing-6']},
  // Two columns: the second-to-last item needs no divider either; it starts the last row, or with an odd count it
  // sits above the empty cell. The default restates List's divider width,
  // since a key set here replaces List's own value at every width.
  lastRowStart: {borderBottomWidth: {default: 'var(--border-width)', [media.desktop]: 0}},
  aboutHeading: {textAlign: {default: 'center', [media.desktop]: 'start'}, alignItems: {default: 'center', [media.desktop]: 'flex-start'}},
  posts: {gridTemplateColumns: {default: 'minmax(0, 1fr)', [media.desktop]: 'repeat(3, minmax(0, 1fr))'}, alignItems: 'stretch'},
  logos: {gridTemplateColumns: {default: 'repeat(3, minmax(0, 1fr))', [media.tablet]: 'repeat(3, minmax(0, 1fr))', [media.desktop]: 'repeat(6, minmax(0, 1fr))'}},
  logoScale: (scale: number) => ({transform: `scale(${scale})`}),
  logoBox: {width: '100%', justifyContent: 'center', height: {default: 'calc(var(--size-element-lg) * 1.6)', [media.tablet]: 'calc(var(--size-element-lg) * 2.5)'}, padding: space['--spacing-4'], boxSizing: 'border-box'},
  logo: {width: '100%', height: '100%', objectFit: 'contain'},
});
