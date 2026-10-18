// The board is the page's content, so it starts at once; the status request goes out beside the
// board's script rather than after it.
import {islandSelector} from '../islands/kinds';
import {prefetch} from '../islands/prefetch';
import {schedule} from '../islands/schedule';
import {STATUS_API, statusRequest} from './statusApi';

/** Starts the status island from `load`, its client module, when the page has a status container. */
export function startStatus(load: () => Promise<{mount: () => Promise<void>}>): void {
  if (document.querySelector(islandSelector('status')) == null) return;
  void schedule('status', [{kind: 'now'}], () => {
    prefetch(STATUS_API, statusRequest());
    return load().then(({mount}) => mount());
  });
}
