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
  unknown: string;
}

async function mirrorsByHost(): Promise<Map<string, StatusMirror>> {
  try {
    const response = await fetch(STATUS_API, {mode: 'cors', signal: AbortSignal.timeout(15_000)});
    if (!response.ok) return new Map();
    const data = (await response.json()) as {mirrors?: {list?: StatusMirror[]}};
    return new Map((data.mirrors?.list ?? []).map(mirror => [mirror.host, mirror]));
  } catch {
    return new Map();
  }
}

/** Replace every placeholder: a state when the API reports the host, the unknown dash otherwise. */
export async function fillHealth(island: HTMLElement): Promise<void> {
  const labels = JSON.parse(island.dataset.gzLabels ?? '{}') as Labels;
  const byHost = await mirrorsByHost();
  for (const cell of island.querySelectorAll<HTMLElement>('[data-gz-mirror-host]')) {
    const mirror = byHost.get(cell.dataset.gzMirrorHost ?? '');
    const lag = Math.max(0, ...(mirror?.trees ?? []).map(tree => tree.lagSec ?? 0));
    const label = mirror == null ? labels.unknown : !mirror.up ? labels.down : lag > LAG_LIMIT_SEC ? labels.lag : labels.up;
    cell.textContent = label ?? '';
  }
}
