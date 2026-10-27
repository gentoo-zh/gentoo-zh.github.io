import {createElement} from 'react';
import {LANGUAGE_TAG, providerMessages} from '../../i18n/locales';
import {IslandMount} from '../chrome/IslandMount';
import {renderStatic} from '../renderStatic';
import type {PageListProps} from './ChapterNavGroups';
import {chapterNavIdPrefix, ChapterNavIsland, type ChapterNavIslandProps, type ChapterNavPlace} from './ChapterNavIsland';
import {ChapterSideNav, MobileChapters} from './PostChapters';

/** A paged post's page list as two `chapters` islands: Base's `sideNav`, and PagedArticle's `pageList` for phones. */
export async function renderChapterNav(list: PageListProps) {
  const languageTag = LANGUAGE_TAG[list.locale];
  const messages = Object.fromEntries(Object.entries(providerMessages(list.locale)[languageTag]).filter(([key]) => /^gz\.section\.overview$|^gz\.post\.(chapters|chapterIntro)$|^@astryx\.(sideNav|sideNavItem|popover|tooltip|layer)\./.test(key)));
  const island = async (place: ChapterNavPlace) => {
    const props: ChapterNavIslandProps = {...list, place, languageTag, messages};
    const html = await renderStatic(createElement(ChapterNavIsland, props), {identifierPrefix: chapterNavIdPrefix(place)});
    return createElement(IslandMount, {html, props, island: 'chapters'});
  };
  const [side, phone] = await Promise.all([island('side'), island('phone')]);
  return {sideNav: createElement(ChapterSideNav, null, side), pageList: createElement(MobileChapters, null, phone)};
}
