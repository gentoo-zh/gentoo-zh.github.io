import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {AppShell} from '@astryxdesign/core/AppShell';
import {VStack} from '@astryxdesign/core/Layout';
import {layout, media} from '../theme/layout.stylex';
import type {Locale} from '../i18n/locales';
import {IslandMount, type IslandMountProps} from './chrome/IslandMount';
import {SiteFooter} from './SiteFooter';
import {SiteI18n} from './SiteProviders';

// The body resolves fonts before this wrapper sets locale fallbacks, so set font-family here too.
const LATIN = 'var(--font-figtree,Figtree)';
const TAIL = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SC = '"PingFang SC", "Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei"';
const TC = '"PingFang TC", "Noto Sans CJK TC", "Source Han Sans TC", "Microsoft JhengHei"';
const fonts = stylex.create({
  'zh-cn': {display: 'contents', fontFamily: 'var(--font-family-body)', '--font-family-body': `${LATIN}, ${SC}, ${TC}, ${TAIL}`, '--font-family-heading': `${LATIN}, ${SC}, ${TC}, ${TAIL}`},
  'zh-tw': {display: 'contents', fontFamily: 'var(--font-family-body)', '--font-family-body': `${LATIN}, ${TC}, ${SC}, ${TAIL}`, '--font-family-heading': `${LATIN}, ${TC}, ${SC}, ${TAIL}`},
  en: {display: 'contents'},
});

const styles = stylex.create({
  sidebarPage: {
    display: {default: 'contents', [media.tablet]: 'block'},
    width: '100%',
    minWidth: 0,
    maxWidth: layout.sidebarPageMaxWidth,
    marginInline: 'auto',
  },
});

export interface SiteShellProps {
  locale: Locale;
  nav: IslandMountProps;
  /** Optional category sidebar. */
  sideNav?: ReactNode;
  children: ReactNode;
}

// Navigation hydrates from pre-rendered HTML; the rest of the shell stays static.
export function SiteShell({locale, nav, sideNav, children}: SiteShellProps) {
  return (
    <SiteI18n locale={locale}>
      <div {...stylex.props(fonts[locale])}>
        <AppShell variant="surface" height="auto" mobileNav={false} topNav={<IslandMount {...nav} />} sideNav={sideNav}>
          {sideNav == null ? children : <VStack xstyle={styles.sidebarPage}>{children}</VStack>}
        </AppShell>
        <SiteFooter locale={locale} />
      </div>
    </SiteI18n>
  );
}
