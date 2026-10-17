// Render the package table, with its dependency view, once the hourly index loads; replace the skeleton either way.
import type {ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {Banner} from '@astryxdesign/core/Banner';
import {PackagesTable, type PackageIndex} from './PackagesTable';
import {PACKAGES_ISLAND, PACKAGES_SOURCE, type PackagesIslandProps} from './packagesData';
import {useMessage} from '../../i18n/useMessage';

async function load(url: string): Promise<PackageIndex | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const index = (await response.json()) as PackageIndex;
    return Array.isArray(index.packages) ? index : null;
  } catch {
    return null;
  }
}

function LoadFailed() {
  const t = useMessage();
  return <Banner status="error" title={t('gz.packages.loadFailed')} />;
}

async function mount(root: HTMLElement, {languageTag, messages, statusHref}: PackagesIslandProps) {
  const [stable, unstable] = await Promise.all([load(PACKAGES_SOURCE.stable), load(PACKAGES_SOURCE.unstable)]);
  const provide = (node: ReactNode) => (
    <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
      {node}
    </InternationalizationProvider>
  );
  const tables = createRoot(root, {identifierPrefix: 'gz-packages-'});
  if (stable == null) {
    tables.render(provide(<LoadFailed />));
    return;
  }
  tables.render(provide(<PackagesTable languageTag={languageTag} stable={stable} unstable={unstable} statusHref={statusHref} />));
}

const root = document.querySelector<HTMLElement>(`[data-gz-island="${PACKAGES_ISLAND}"]`);
if (root?.dataset.props != null) {
  void mount(root, JSON.parse(root.dataset.props) as PackagesIslandProps);
}
