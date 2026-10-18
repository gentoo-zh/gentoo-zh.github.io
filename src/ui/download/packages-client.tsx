// Render the package table, with its dependency view, once the hourly index loads; replace the skeleton either way.
import type {ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {Banner} from '@astryxdesign/core/Banner';
import {readySignal} from '../chrome/hydrateIsland';
import {PackagesTable, type PackageIndex} from './PackagesTable';
import {islandSelector} from '../islands/kinds';
import {PACKAGES_SOURCE, type PackagesIslandProps} from './packagesData';
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

async function render(root: HTMLElement, {languageTag, messages, statusHref}: PackagesIslandProps) {
  const [stable, unstable] = await Promise.all([load(PACKAGES_SOURCE.stable), load(PACKAGES_SOURCE.unstable)]);
  const {wrap, ready, onUncaughtError} = readySignal();
  const provide = (node: ReactNode) =>
    wrap(
      <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
        {node}
      </InternationalizationProvider>,
    );
  const tables = createRoot(root, {identifierPrefix: 'gz-packages-', onUncaughtError});
  tables.render(provide(stable == null ? <LoadFailed /> : <PackagesTable languageTag={languageTag} stable={stable} unstable={unstable} statusHref={statusHref} />));
  await ready;
}

/** Fetches the index and renders the table, or the failure banner; resolves once either has committed. */
export function mount(): Promise<void> {
  const root = document.querySelector<HTMLElement>(islandSelector('packages'));
  return root?.dataset.props == null ? Promise.resolve() : render(root, JSON.parse(root.dataset.props) as PackagesIslandProps);
}
