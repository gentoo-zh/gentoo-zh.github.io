import {createHash} from 'node:crypto';

/** The wall repeats every WALL_PERIOD tiles in both directions, so a one-period translation loops seamlessly. */
export const WALL_PERIOD = 14;
/** Avatars the AvatarGroups show before the overflow count. */
export const GROUP_AVATARS = 6;

/** One period of the wall, row by row: avatar `i` fills tile `i`, wrapping when there are fewer people than tiles. */
export function wallSources(avatars: readonly string[]): string[] {
  return Array.from({length: WALL_PERIOD * WALL_PERIOD}, (_, index) => avatars[index % avatars.length]!);
}

/**
 * Fingerprint of the avatar addresses the home images show, in order. homeData compares it with
 * home-images.json, which scripts/gen-home-images.mjs writes, so a changed contributor list fails the build.
 */
export function homeImageOrder(avatars: readonly string[]): string {
  const order = {wall: wallSources(avatars), group: avatars.slice(0, GROUP_AVATARS)};
  return createHash('sha256').update(JSON.stringify(order)).digest('hex').slice(0, 16);
}
