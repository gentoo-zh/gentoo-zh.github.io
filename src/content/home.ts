/** Days since the community was founded on 2013-02-05, counted at build time as on the Hugo site. */
export function daysRunning(now = new Date()): number {
  return Math.floor((now.getTime() - Date.UTC(2013, 1, 5)) / 86_400_000);
}
