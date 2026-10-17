// Mask the wordmark with a theme token so static markup follows the saved or system colour mode.
import * as stylex from '@stylexjs/stylex';
import {SITE} from '../../site';
import {LAYOUT} from '../../theme/layout.stylex';

const styles = stylex.create({
  frame: {
    position: 'relative',
    display: 'block',
    width: LAYOUT.wordmarkWidth,
    height: LAYOUT.wordmarkHeight,
  },
  mark: {display: 'block'},
  wordmark: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'var(--color-wordmark)',
    maskImage: 'url(/img/logo-wordmark-mask.svg)',
    maskSize: '100% 100%',
    maskRepeat: 'no-repeat',
  },
});

export function Wordmark() {
  return (
    <div {...stylex.props(styles.frame)}>
      <img src={SITE.wordmark.mark} alt="" width={LAYOUT.wordmarkWidth} height={LAYOUT.wordmarkHeight} {...stylex.props(styles.mark)} />
      <div aria-hidden="true" {...stylex.props(styles.wordmark)} />
    </div>
  );
}
