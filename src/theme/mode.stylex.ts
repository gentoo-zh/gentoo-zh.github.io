// Show one of two elements by colour mode: the system preference, overridden by the theme toggle
// (html[data-theme]). Used for logos that ship a separate dark-mode file.
import * as stylex from '@stylexjs/stylex';

export const modeDisplay = stylex.create({
  light: {display: {default: 'block', '@media (prefers-color-scheme: dark)': 'none', ':is(html[data-theme="light"] *)': 'block', ':is(html[data-theme="dark"] *)': 'none'}},
  dark: {display: {default: 'none', '@media (prefers-color-scheme: dark)': 'block', ':is(html[data-theme="light"] *)': 'none', ':is(html[data-theme="dark"] *)': 'block'}},
});
