// Render the package table once the hourly index loads.
import {createRoot} from 'react-dom/client';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {PackagesTable, type PackageIndex} from './PackagesTable';
import {PACKAGES_ISLAND, PACKAGES_SOURCE, type PackagesIslandProps} from './packagesData';

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

async function mount(root: HTMLElement, {languageTag, messages}: PackagesIslandProps) {
  const [stable, unstable] = await Promise.all([load(PACKAGES_SOURCE.stable), load(PACKAGES_SOURCE.unstable)]);
  if (stable == null) return;
  createRoot(root, {identifierPrefix: 'gz-packages-'}).render(
    <InternationalizationProvider locale={languageTag} messages={{[languageTag]: messages}}>
      <PackagesTable languageTag={languageTag} stable={stable} unstable={unstable} />
    </InternationalizationProvider>,
  );
}

const root = document.querySelector<HTMLElement>(`[data-gz-island="${PACKAGES_ISLAND}"]`);
if (root?.dataset.props != null) {
  void mount(root, JSON.parse(root.dataset.props) as PackagesIslandProps);
}
