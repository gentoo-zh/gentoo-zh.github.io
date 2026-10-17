// Server and client render this independent React root with identical props and messages.
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {SiteTopNav, type SiteTopNavProps} from './SiteTopNav';
import {ThemeModeProvider} from './themeMode';

/** Keeps the island's `useId` values apart from the static page's. */
export const NAV_ISLAND_ID_PREFIX = 'gz-nav-';

export interface NavIslandProps extends SiteTopNavProps {
  languageTag: string;
  /** Only the catalog entries the navigation needs, so they can travel with the page. */
  messages: Record<string, string>;
}

export function NavIslandRoot({languageTag, messages, ...nav}: NavIslandProps) {
  return (
    <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
      <ThemeModeProvider>
        <SiteTopNav {...nav} />
      </ThemeModeProvider>
    </InternationalizationProvider>
  );
}
