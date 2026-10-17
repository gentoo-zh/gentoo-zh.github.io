// Render the directory browser for the path below /files/ in the address bar.
import {createRoot} from 'react-dom/client';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {FilesTable} from './FilesTable';
import {FILES_ISLAND, type FilesIslandProps} from './filesData';

const root = document.querySelector<HTMLElement>(`[data-gz-island="${FILES_ISLAND}"]`);
if (root?.dataset.props != null) {
  const {languageTag, messages, origin, base} = JSON.parse(root.dataset.props) as FilesIslandProps;
  // Deep paths without a trailing slash reach the same page; every link this page builds has one.
  if (!window.location.pathname.endsWith('/')) {
    window.history.replaceState(null, '', `${window.location.pathname}/${window.location.search}${window.location.hash}`);
  }
  createRoot(root, {identifierPrefix: 'gz-files-'}).render(
    <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
      <FilesTable languageTag={languageTag} origin={origin} base={base} />
    </InternationalizationProvider>,
  );
}
