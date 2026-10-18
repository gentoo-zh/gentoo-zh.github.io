// Content images sized by CSS, for scripts/lib/image-variants.mjs: `widths` are the variants the build writes (the
// slot at dpr 1-3) and `sizes` an upper bound of the slot's content width, measured from 320px to 1600px wide.
// Separate exports keep each value out of client bundles that do not render that image.
import {AVATAR} from './scale';

/** Post covers and body images: the 800px prose column less its padding, the viewport less 3rem on phones. */
export const PROSE_IMAGE = {widths: '400 800', sizes: '(min-width: 768px) 752px, calc(100vw - 3rem)'} as const;
/** /thanks/ tiles on the logoColumn grid, less their spacing-8 inset. */
export const THANKS_LOGO_IMAGE = {widths: '180 360', sizes: '(min-width: 1280px) 174px, (min-width: 768px) 240px, calc(100vw - 7rem)'} as const;
/** Home sponsor row: six columns from 1024px, three below. */
export const HOME_LOGO_IMAGE = {widths: '100 150 200 300', sizes: '(min-width: 1024px) 148px, (min-width: 768px) 276px, calc((100vw - 11rem) / 3)'} as const;
/** /logo/ download tiles, less their spacing-6 inset. */
export const LOGO_TILE_IMAGE = {widths: '200 400', sizes: '(min-width: 1280px) 185px, (min-width: 768px) 260px, calc(100vw - 6rem)'} as const;
/** Contributor page avatar: AVATAR.profile on phones, AVATAR.profileDesktop from 768px. */
export const PROFILE_IMAGE = {widths: '96 128 192 256 288', sizes: `(min-width: 768px) ${AVATAR.profileDesktop}px, ${AVATAR.profile}px`} as const;
