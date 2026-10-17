import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {SideNav} from '@astryxdesign/core/SideNav';
import {useMessage} from '../../i18n/useMessage';
import {media, typography} from '../../theme/layout.stylex';

const styles = stylex.create({
  sideNav: {
    color: 'var(--color-text-primary)',
    '--text-label-size': typography.sidebarLabelSize,
    '--text-label-leading': '1.5',

    display: {
      default: 'flex',
      [media.mobile]: 'none',
    },
    // Inherited scrollbar colour reveals the nested scroller on hover or focus.
    scrollbarColor: {
      default: 'transparent transparent',
      ':hover': 'var(--color-border-emphasized) transparent',
      ':focus-within': 'var(--color-border-emphasized) transparent',
    },
  },
  // SideNav's scroller accepts no xstyle and scrollbar-width does not inherit; scroll this wrapper instead.
  scroll: {
    height: '100%',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
  },
});

// The fixed-width frame stays static; only its collapsible groups hydrate.
export function SectionSideNav({children}: {children: ReactNode}) {
  const t = useMessage();
  return (
    <SideNav aria-label={t('gz.nav.label')} xstyle={styles.sideNav}>
      <div {...stylex.props(styles.scroll)}>{children}</div>
    </SideNav>
  );
}
