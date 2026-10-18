// One refresh feeds every status container; failed refreshes retain the last successful data.
import type {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import {readySignal} from '../chrome/hydrateIsland';
import {islandSelector} from '../islands/kinds';
import {fetchPrefetched} from '../islands/prefetch';
import {StatusIslandRoot, type BoardProps, type StatusData, type StatusIslandProps} from './StatusBoard';
import {STATUS_API, statusRequest} from './statusApi';

let mounted = false;

/** Renders every status container once the first refresh settles; resolves once they have committed. */
export async function mountStatus(Root: ComponentType<StatusIslandProps & BoardProps> = StatusIslandRoot): Promise<void> {
  if (mounted) return;
  const containers = [...document.querySelectorAll<HTMLElement>(islandSelector('status'))];
  if (containers.length === 0) return;
  mounted = true;
  const islands = containers.filter(container => container.dataset.props != null).map(container => {
    const signal = readySignal();
    return {
      root: createRoot(container, {identifierPrefix: 'gz-status-', onUncaughtError: signal.onUncaughtError}),
      props: JSON.parse(container.dataset.props!) as StatusIslandProps,
      ...signal,
    };
  });
  let data: StatusData | null = null;
  let pending = false;
  let timer: ReturnType<typeof setTimeout>;
  async function refresh() {
    if (pending) return;
    pending = true;
    clearTimeout(timer);
    let failed = false;
    try {
      // The first refresh takes the request StatusScript sent while this module loaded.
      const response = await fetchPrefetched(STATUS_API, statusRequest());
      if (!response.ok) throw new Error(`Status API: ${response.status}`);
      const json = (await response.json()) as StatusData;
      if (!Array.isArray(json.sites) || json.sites.length === 0) throw new Error('Missing services');
      data = json;
    } catch {
      failed = true;
    }
    for (const {root, props, wrap} of islands) {
      root.render(wrap(<Root {...props} data={data} failed={failed} onRetry={refresh} />));
    }
    pending = false;
    timer = setTimeout(() => void refresh(), 45_000);
  }
  await refresh();
  await Promise.all(islands.map(({ready}) => ready));
}

export const mount = () => mountStatus();
