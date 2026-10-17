// Patch the static health cells from the status API; it permits cross-origin requests.

const STATUS_API = 'https://status.gentoozh.org/api/status';
/** A tree that trails the origin by more than a day is reported as lagging. */
const LAG_LIMIT_SEC = 86400;

interface StatusMirror {
  host: string;
  up: boolean;
  trees?: {lagSec?: number | null}[];
}

interface Labels {
  up: string;
  lag: string;
  down: string;
}

export async function fillHealth(island: HTMLElement): Promise<void> {
  const labels = JSON.parse(island.dataset.gzLabels ?? '{}') as Labels;
  const response = await fetch(STATUS_API, {mode: 'cors'});
  if (!response.ok) return;
  const data = (await response.json()) as {mirrors?: {list?: StatusMirror[]}};
  const byHost = new Map((data.mirrors?.list ?? []).map(mirror => [mirror.host, mirror]));
  for (const cell of island.querySelectorAll<HTMLElement>('[data-gz-mirror-host]')) {
    const mirror = byHost.get(cell.dataset.gzMirrorHost ?? '');
    if (mirror == null) continue;
    const lag = Math.max(0, ...(mirror.trees ?? []).map(tree => tree.lagSec ?? 0));
    const label = !mirror.up ? labels.down : lag > LAG_LIMIT_SEC ? labels.lag : labels.up;
    if (typeof label === 'string' && label !== '') cell.textContent = label;
  }
}
