// A request the startup layer sends while the island's script downloads, so the island's data and code
// arrive together. The island's first fetch of the same URL takes the response; later fetches go out anew.

interface Early {
  response: Promise<Response>;
  controller: AbortController;
}

const early = new Map<string, Early>();

/** Sends `url` now; `init.signal`, such as a timeout, bounds the request from this moment. */
export function prefetch(url: string, init: RequestInit = {}): void {
  if (early.has(url)) return;
  const controller = new AbortController();
  const {signal} = init;
  signal?.addEventListener('abort', () => controller.abort(signal.reason), {once: true});
  const response = fetch(url, {...init, signal: controller.signal});
  // The island that takes the response handles a failure; until then it is not an unhandled rejection.
  response.catch(() => {});
  early.set(url, {controller, response});
}

/** The prefetched response for `url`, once, or a new request. Aborting `init.signal` aborts either. */
export function fetchPrefetched(url: string, init: RequestInit = {}): Promise<Response> {
  const request = early.get(url);
  if (request == null) return fetch(url, init);
  early.delete(url);
  const {signal} = init;
  if (signal?.aborted) request.controller.abort(signal.reason);
  else signal?.addEventListener('abort', () => request.controller.abort(signal.reason), {once: true});
  return request.response;
}
