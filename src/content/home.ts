/** The community's founding day, 2013-02-05 (UTC). */
export const FOUNDED_UTC = Date.UTC(2013, 1, 5);

/** Days since the community was founded, counted at build time as on the Hugo site; HomeLive.astro recounts it in the browser. */
export function daysRunning(now = new Date()): number {
  return Math.floor((now.getTime() - FOUNDED_UTC) / 86_400_000);
}
