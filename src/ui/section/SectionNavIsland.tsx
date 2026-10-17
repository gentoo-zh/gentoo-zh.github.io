import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {SectionNavGroups, type SectionSideNavProps} from './SectionNavGroups';

export const SECTION_NAV_ID_PREFIX = 'gz-section-';

export interface SectionNavIslandProps extends SectionSideNavProps {
  languageTag: string;
  messages: Record<string, string>;
}

export function SectionNavIsland({languageTag, messages, ...nav}: SectionNavIslandProps) {
  return (
    <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
      <SectionNavGroups {...nav} />
    </InternationalizationProvider>
  );
}
