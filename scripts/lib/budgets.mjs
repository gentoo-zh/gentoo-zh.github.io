import {htmlElements} from './html-elements.mjs';

// Brotli script budgets per page type; the first matching route wins. Each type has two:
// - `startup`: the startup closure, i.e. module scripts, modulepreloads and their static imports, which
//   the browser requests before the load event. Only the islands' boot modules belong here; React, the
//   navigation chunk and each island's code arrive when the scheduler starts the island (astro.config.ts).
// - `total`: the whole closure, idle imports included.
// check:budget measures both on every page of dist/. check:runtime loads each type's `sample` in a
// browser and holds the scripts requested before `load` to `beforeLoad`, which is `startup` unless an
// island starts at once (`now`: status, files) and its code is requested before `load` by design.
// All figures are measured on the current build (2026-10-18) and rounded up to the next 100 B; raise one
// only with the change that needs it, and say why in its comment.

/** Only imports reached on user action from onDemand owners use this separate budget. */
// CommandPalette adds grouped results and keyboard selection only after opening search.
export const ON_DEMAND = 28_000;

/** Fragment-aware redirects load only the inline map resolver, which is not a requested script. */
const REDIRECT = {startup: 0, total: 512};

/** Redirects without fragment anchors run no script at all. */
const PLAIN_REDIRECT = {startup: 0, total: 0};

const locale = path => new RegExp(`^(\\/zh-tw|\\/en)?${path}$`);

// Startup rose about 300 B on every type, and 520 B on contributors, when held input became an ordered
// queue with native fallbacks for links, focus tracking for text fields, and contributors' role toggles
// replayed by category (`islands/intent.ts`, `contributors/roles.ts`).
// Startup rose 114 B on every type (`beforeLoad` +200 B) when the boot script began remembering a
// language picked from the menu (`chrome/languageChoice.ts`).
export const PAGE_TYPES = [
  // The board and its history render from the status API; Recharts stays lazy. `beforeLoad` is the startup
  // closure plus the board's (React and the navigation chunk included); how much of it a browser requests
  // before `load` varies from run to run (90-184 KB measured).
  // status, mirrorlist and packages: +100 B when `visible` began waiting for `load` (2026-10-18).
  {name: 'status', route: locale('/status/'), sample: '/status/', startup: 5_900, beforeLoad: 185_900, total: 277_800},
  // Home renders statically; the live counts and the status badge add their boot modules.
  {name: 'home', route: locale('/'), sample: '/', startup: 4_600, total: 147_900},
  // Mirror health updates and legacy fragment resolution extend the section scripts.
  {name: 'mirrorlist', route: locale('/mirrorlist/'), sample: '/mirrorlist/', startup: 5_300, total: 150_200},
  // A sortable, filterable table with the dependency view and its search controls.
  {name: 'packages', route: locale('/packages/'), sample: '/packages/', startup: 5_400, total: 235_600},
  // The listing renders from distfiles' `/_ls/`; `beforeLoad` is the startup closure plus the browser's.
  {name: 'files', route: locale('/files/'), sample: '/files/', startup: 6_000, beforeLoad: 162_100, total: 165_600},
  // Setup guides add mirror/channel/sudo controls, pane switching and code rewriting.
  {name: 'guide', route: locale('/(?:overlay|binpkg-setup|distfiles-setup|gentoo-(?:repo|distfiles|binpkg|prefix)-setup)/'), sample: '/overlay/', startup: 6_000, total: 171_500},
  // Contributor lists hydrate filters and cards; profiles share this route family's budget.
  {name: 'contributors', route: locale('/contributors/(?:[^/]+/)?'), sample: '/contributors/', startup: 5_600, total: 164_600},
  // The cost explanation popovers.
  {name: 'costs', route: locale('/costs/'), sample: '/costs/', startup: 5_300, total: 153_600},
  // Posts need the copy delegate; a post with headings adds the outline spy (measured startup 4338 B,
  // total up to 148068 B, 2026-10-26); one without headings loads no spy.
  {name: 'post', route: locale('/posts/[^/]+/'), sample: '/posts/2013-02-05-gentoo-zh-community-has-been-founded/', startup: 4_400, total: 148_100},
  // Section pages and the rest: the sidebar boot, the outline spy and the copy delegate.
  {name: 'section', route: /.*/, sample: '/faq/', startup: 4_900, total: 149_600},
];

/** Redirect pages (Redirect.astro) have no site frame. */
export const isRedirect = html => htmlElements(html).some(({name, attrs}) => name === 'meta' && attrs.get('http-equiv')?.toLowerCase() === 'refresh');

/** The budgets for `page`, given its HTML and whether a redirect carries fragment anchors. */
export function budgetFor(page, html, anchors) {
  if (isRedirect(html)) return anchors ? REDIRECT : PLAIN_REDIRECT;
  return PAGE_TYPES.find(({route}) => route.test(page));
}
