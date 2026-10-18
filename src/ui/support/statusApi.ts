// The status endpoint, without the board's components, for the startup script that requests it early.

/** The live status endpoint; it sends `access-control-allow-origin: *`. */
export const STATUS_API = 'https://status.gentoozh.org/api/status';

/** How the board requests it: never from the cache, and given up after 15 seconds. */
export const statusRequest = (): RequestInit => ({cache: 'no-store', signal: AbortSignal.timeout(15_000)});
