import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {ChapterNavGroups, type ChapterNavGroupsProps} from './ChapterNavGroups';

/** Where a copy of the list sits; each copy is its own root and needs its own `useId` prefix. */
export type ChapterNavPlace = 'side' | 'phone';

export const chapterNavIdPrefix = (place: ChapterNavPlace) => `gz-chapters-${place}-`;

export interface ChapterNavIslandProps extends ChapterNavGroupsProps {
  place: ChapterNavPlace;
  languageTag: string;
  messages: Record<string, string>;
}

// `place` names the root only; the list ignores it.
export function ChapterNavIsland({languageTag, messages, ...nav}: ChapterNavIslandProps) {
  return (
    <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
      <ChapterNavGroups {...nav} />
    </InternationalizationProvider>
  );
}
