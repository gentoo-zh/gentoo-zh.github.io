// Adapted from the Astryx docsite theme (apps/docsite/src/themes/astryxTheme.ts, MIT, Meta Platforms, Inc.).
// Filled accents use Gentoo purple; text and icon accents use neutral ink.

import {defineTheme, type TokenValue} from '@astryxdesign/core/theme';
import {defineSyntaxTheme} from '@astryxdesign/core/theme/syntax';

declare module '@astryxdesign/core/theme' {
  interface CustomTextTypes {
    metric: true;
    'service-metric': true;
  }
}

const PRIMARY = 'light-dark(#181818, #E2E2E2)';


// Lighten the dark-mode brand colour for contrast against the body.
const BRAND = 'light-dark(#54487A, #A99BD6)';

// The logo's wordmark colours, taken from public/img/logo-horizontal.svg and its dark variant.
const WORDMARK = 'light-dark(#514776, #DDDAEA)';

const customTokens: Record<string, TokenValue> = {
  '--color-brand': BRAND,
  '--color-wordmark': WORDMARK,
  '--color-home-hero-glow': 'light-dark(rgba(129, 106, 184, 0.24), rgba(129, 106, 184, 0.27))',
  // Dark cards need a raised surface because the muted tint disappears against the body.
  '--color-home-card': 'light-dark(#F4F4F4, #1F1F1F)',
  '--color-home-icon-tint': 'light-dark(rgba(84, 72, 122, 0.1), rgba(169, 155, 214, 0.16))',
  '--home-display-size': 'clamp(2.25rem, 4.8vw, 4rem)',
  '--home-terminal-background': '#171717',
  '--home-terminal-foreground': '#F5F5F5',
  '--home-terminal-muted': '#B8B8B8',
  '--home-terminal-border': '#383838',
  '--home-terminal-dot': '#777777',
  '--color-syntax-prompt-root': 'light-dark(#A3293D, #EBA0AA)',
  '--color-syntax-prompt-user': 'light-dark(#27633D, #9BC7A4)',
};

// SiteShell selects the CJK fallback order by locale.
const FALLBACKS =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "PingFang TC", "Noto Sans CJK SC", "Noto Sans CJK TC", "Microsoft YaHei", "Microsoft JhengHei", Helvetica, Arial, sans-serif';

export const gentooTheme = defineTheme({
  name: 'gentoo',

  syntax: defineSyntaxTheme({
    name: 'gentoo',
    tokens: {
      keyword: ['#654C86', '#C1A9DD'],
      string: ['#376345', '#A4C5AC'],
      comment: ['#62656B', '#A3A5AC'],
      number: ['#855023', '#D6B38A'],
      function: ['#365F7D', '#A3C3DB'],
      type: ['#654C86', '#C1A9DD'],
      variable: ['#855023', '#D6B38A'],
      operator: ['#654C86', '#C1A9DD'],
      constant: ['#855023', '#D6B38A'],
      tag: ['#654C86', '#C1A9DD'],
      attribute: ['#365F7D', '#A3C3DB'],
      property: ['#365F7D', '#A3C3DB'],
      punctuation: ['#62656B', '#A3A5AC'],
      background: 'var(--color-background-muted)',
    },
  }),

  tokens: {
    '--color-accent': BRAND,
    '--color-text-accent': PRIMARY,
    '--color-icon-accent': PRIMARY,
    '--color-accent-muted': 'light-dark(rgba(84, 72, 122, 0.1), rgba(169, 155, 214, 0.16))',
    '--color-on-accent': 'light-dark(#FFFFFF, #181818)',
    '--color-background-body': 'light-dark(#FFFFFF, #111111)',
    '--color-background-surface': 'light-dark(#FFFFFF, #1F1F1F)',
    '--color-background-card': 'light-dark(#FFFFFF, #1F1F1F)',
    '--color-background-popover': 'light-dark(#FFFFFF, #282828)',
    '--color-background-inverted': 'light-dark(#181818, #FFFFFF)',
    '--color-background-muted': 'light-dark(#1818180C, #1111117F)',
    '--color-neutral': 'light-dark(#18181819, #E2E2E233)',
    '--color-overlay': 'light-dark(#18181866, #11111199)',
    '--color-overlay-hover': 'light-dark(#1818180C, #FFFFFF0C)',
    '--color-overlay-pressed': 'light-dark(#18181819, #FFFFFF19)',
    '--color-text-secondary': 'light-dark(#606060, #B5B5B5)',
    '--color-icon-secondary': 'light-dark(#606060, #B5B5B5)',
    '--color-text-disabled': 'light-dark(#AAAAAA, #777777)',
    '--color-icon-disabled': 'light-dark(#AAAAAA, #777777)',
    '--color-border': 'light-dark(#1818181A, #FFFFFF1A)',
    '--color-border-emphasized': 'light-dark(#929292, #676767)',

    '--color-text-primary': PRIMARY,
    '--color-icon-primary': PRIMARY,

    '--text-display-1-weight': 'var(--font-weight-semibold)',
    '--text-display-2-weight': 'var(--font-weight-semibold)',
    '--text-display-3-weight': 'var(--font-weight-semibold)',
    '--radius-inner': '8px',
    '--radius-element': '12px',
    '--radius-container': '16px',
    '--radius-page': '32px',

    ...customTokens,
  },

  typography: {
    body: {family: 'var(--font-figtree,Figtree)', fallbacks: FALLBACKS},
    heading: {family: 'var(--font-figtree,Figtree)', fallbacks: FALLBACKS},
  },

  components: {
    // Numeric callouts keep the data heading scale without entering the document outline.
    text: {
      'type:metric': {
        fontSize: 'var(--text-heading-2-size)',
        fontWeight: 'var(--text-heading-2-weight)',
        lineHeight: 'var(--text-heading-2-leading)',
      },
      'type:service-metric': {
        fontSize: 'var(--text-heading-3-size)',
        fontWeight: 'var(--text-heading-3-weight)',
        lineHeight: 'var(--text-heading-3-leading)',
      },
    },
    'segmented-control-item': {
      base: {'--color-text-secondary': 'var(--color-text-primary)'},
    },
    // Static tables never hydrate useScrollableArea's initial clipped viewport.
    'table-scroll-wrapper': {
      base: {overflowX: 'auto', overflowY: 'hidden', overscrollBehaviorX: 'contain'},
    },
    'switch-label': {
      base: {minHeight: 'var(--size-element-md)', alignItems: 'center'},
    },
    button: {
      base: {borderRadius: 'var(--radius-full)'},
    },
    // Let the translucent top navigation reveal the content beneath it.
    'app-shell-header': {
      base: {backgroundColor: 'transparent'},
    },
    'top-nav-item': {
      selected: {
        backgroundColor: 'transparent',
        ':hover': {backgroundColor: 'var(--color-overlay-hover)'},
        ':active': {backgroundColor: 'var(--color-overlay-pressed)'},
      },
    },
    markdown: {
      base: {'--text-body-size': 'var(--font-size-lg)', '--text-body-leading': '1.6471'},
    },
  },

  adaptations: {
    rules: [
      {
        when: {width: {below: 'sm'}},
        value: {
          components: {
            'top-nav-item': {base: {paddingInline: 'var(--spacing-2)'}},
          },
        },
      },
      {
        when: {width: {below: 'sm'}},
        value: {
          tokens: {
            '--text-display-1-size': 'var(--font-size-3xl)',
            '--text-display-2-size': 'var(--font-size-2xl)',
          },
        },
      },
      {
        // Touch targets of at least 44px below the md breakpoint.
        when: {width: {below: 'md'}},
        value: {
          tokens: {'--size-element-sm': '44px', '--size-element-md': '44px', '--size-element-lg': '44px'},
          components: {
            'code-block-title': {base: {whiteSpace: 'normal', overflowWrap: 'anywhere', minWidth: '0', flexShrink: '1'}},
            'code-block': {base: {
              ':not(:has(.astryx-code-block-header))': {paddingInlineEnd: 'calc(var(--size-element-md) + var(--spacing-2))'},
            }},
            'segmented-control-item': {base: {minHeight: 'var(--size-element-md)'}},
            heading: {base: {textWrap: 'balance'}},
          },
        },
      },
    ],
  },
});
