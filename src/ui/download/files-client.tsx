// Render the directory browser for the path below /files/ in the address bar.
import {createRoot} from 'react-dom/client';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {readySignal} from '../chrome/hydrateIsland';
import {FilesTable} from './FilesTable';
import {islandSelector} from '../islands/kinds';
import type {FilesIslandProps} from './filesData';

/** Renders the browser; resolves once it has committed. */
export function mount(): Promise<void> {
  const root = document.querySelector<HTMLElement>(islandSelector('files'));
  if (root?.dataset.props == null) return Promise.resolve();
  const {languageTag, messages, origin, base} = JSON.parse(root.dataset.props) as FilesIslandProps;
  // Deep paths without a trailing slash reach the same page; every link this page builds has one.
  if (!window.location.pathname.endsWith('/')) {
    window.history.replaceState(null, '', `${window.location.pathname}/${window.location.search}${window.location.hash}`);
  }
  const {wrap, ready, onUncaughtError} = readySignal();
  createRoot(root, {identifierPrefix: 'gz-files-', onUncaughtError}).render(
    wrap(
      <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
        <FilesTable languageTag={languageTag} origin={origin} base={base} />
      </InternationalizationProvider>,
    ),
  );
  return ready;
}
