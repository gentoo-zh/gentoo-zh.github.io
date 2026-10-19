// A language picked from a menu is kept in a cookie that the Worker reads on the next entry
// (src/worker/language.ts). Delegated from the boot script, so the stand-in link counts before the nav mounts.
import {LOCALE_COOKIE} from '../../i18n/localeCookie';

const ATTRIBUTES = 'Path=/; Max-Age=31536000; SameSite=Lax; Secure';

/** A followed same-site link whose `hreflang` names a site language picks that language. */
export function rememberLanguageChoice() {
  const remember = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[hreflang]') : null;
    // A press held for the nav to mount is prevented here; it opens the menu instead of following the link.
    if (link == null || event.defaultPrevented || link.origin !== location.origin) return;
    // A locale code is its lowercased language tag (zh-CN, zh-TW, en); the Worker ignores any other value.
    document.cookie = `${LOCALE_COOKIE}=${link.hreflang.toLowerCase()}; ${ATTRIBUTES}`;
  };
  document.addEventListener('click', event => { if (event.button === 0) remember(event); });
  document.addEventListener('auxclick', event => { if (event.button === 1) remember(event); });
}
