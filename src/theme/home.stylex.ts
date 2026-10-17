import * as stylex from '@stylexjs/stylex';

export const homeTheme = stylex.create({
  scope: {
    color: 'var(--color-text-primary)',
    '--radius-container': '16px',
    '--radius-page': '32px',
  },
});
