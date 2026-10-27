import {createElement} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {readySignal} from '../chrome/hydrateIsland';
import {islandSelector} from '../islands/kinds';
import {chapterNavIdPrefix, ChapterNavIsland, type ChapterNavIslandProps} from './ChapterNavIsland';

/** Hydrates every copy of the page list (the sidebar's and the phone header's); resolves once all are live. */
export function mount(): Promise<void> {
  const roots = [...document.querySelectorAll<HTMLElement>(islandSelector('chapters'))];
  return Promise.all(
    roots.map(root => {
      if (root.dataset.props == null) return Promise.reject(new Error('No chapters island props'));
      const props = JSON.parse(root.dataset.props) as ChapterNavIslandProps;
      const {wrap, ready, onUncaughtError} = readySignal();
      hydrateRoot(root, wrap(createElement(ChapterNavIsland, {...props, scroller: root.parentElement})), {identifierPrefix: chapterNavIdPrefix(props.place), onUncaughtError});
      return ready;
    }),
  ).then(() => {});
}
