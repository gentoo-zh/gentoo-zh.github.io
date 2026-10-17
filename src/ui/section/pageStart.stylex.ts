import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {media} from '../../theme/layout.stylex';

/** The space above every page's title, so titles sit at one height across layouts. */
export const pageStart = stylex.create({
  start: {
    marginBlockStart: {
      default: spacingVars['--spacing-12'],
      [media.mobile]: `calc(${spacingVars['--spacing-12']} - (var(--appshell-header-height, ${spacingVars['--spacing-12']}) - ${spacingVars['--spacing-12']}))`,
    },
  },
});
