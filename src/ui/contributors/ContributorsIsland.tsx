import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {ContributorsLibrary, type ContributorsLibraryProps} from './ContributorsLibrary';

export const CONTRIBUTORS_ISLAND_ID_PREFIX = 'gz-contributors-';
export type ContributorsIslandProps = {
  languageTag: string;
  messages: Record<string, string>;
  kind: 'library';
  page: ContributorsLibraryProps;
};

export function ContributorsIsland({languageTag, messages, ...props}: ContributorsIslandProps) {
  return (
    <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
      <ContributorsLibrary {...props.page} />
    </InternationalizationProvider>
  );
}
