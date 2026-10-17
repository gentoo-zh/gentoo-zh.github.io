// One refresh feeds every status container; failed refreshes retain the last successful data.
import type {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import {STATUS_API, STATUS_ISLAND, STATUS_ISLAND_ATTRIBUTE, StatusIslandRoot, type BoardProps, type StatusData, type StatusIslandProps} from './StatusBoard';

let mounted = false;

export async function mountStatus(Root: ComponentType<StatusIslandProps & BoardProps> = StatusIslandRoot): Promise<void> {
  if (mounted) return;
  const containers = [...document.querySelectorAll<HTMLElement>(`[${STATUS_ISLAND_ATTRIBUTE}="${STATUS_ISLAND}"]`)];
  if (containers.length === 0) return;
  mounted = true;
  const islands = containers.filter(container => container.dataset.props != null).map(container => ({
    root: createRoot(container, {identifierPrefix: 'gz-status-'}),
    props: JSON.parse(container.dataset.props!) as StatusIslandProps,
  }));
  let data: StatusData | null = null;
  let pending = false;
  let timer: ReturnType<typeof setTimeout>;
  async function refresh() {
    if (pending) return;
    pending = true;
    clearTimeout(timer);
    let failed = false;
    try {
      const response = await fetch(STATUS_API, {cache: 'no-store', signal: AbortSignal.timeout(15_000)});
      if (!response.ok) throw new Error(`Status API: ${response.status}`);
      const json = (await response.json()) as StatusData;
      if (!Array.isArray(json.sites) || json.sites.length === 0) throw new Error('Missing services');
      data = json;
    } catch {
      failed = true;
    }
    for (const {root, props} of islands) {
      root.render(<Root {...props} data={data} failed={failed} onRetry={refresh} />);
    }
    pending = false;
    timer = setTimeout(() => void refresh(), 45_000);
  }
  await refresh();
}
