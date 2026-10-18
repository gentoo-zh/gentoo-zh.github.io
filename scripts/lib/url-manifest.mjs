// Check current routes and preserve baseline Hugo pages and redirect targets for their slugs.
export const PAGE_SLUGS = ['', 'docs', 'download', 'community', 'support', 'mirrorlist', 'gentoo-mirrors', 'faq', 'overlay-troubleshooting', 'binpkg-troubleshooting', 'distfiles-troubleshooting', 'paste', 'status', 'overlay', 'binpkg-setup', 'binpkg-signing', 'distfiles-setup', 'about', 'contributing', 'overlay-contributing', 'website-contributing', 'gentoo-repo-setup', 'gentoo-distfiles-setup', 'gentoo-binpkg-setup', 'gentoo-prefix-setup', 'costs', 'thanks', 'logo', 'changelog', 'channels', 'iso', 'official-media', 'packages', 'package-status', 'files', 'contributors', 'posts', 'tags'];

/** Current single/index pages, independent of whether Hugo served them. */
export const ERROR_PAGES = ['/404.html', '/zh-tw/404.html', '/en/404.html'];
export const CURRENT_PAGES = [...PAGE_SLUGS.flatMap(slugPaths), ...ERROR_PAGES];

/** Pages that may ship noindex while a server change they depend on is pending (FILES_INDEXED in src/ui/download/filesData.ts). */
export const NOINDEX_PAGES = slugPaths('files');

/** Legacy redirects to distfiles.gentoozh.org that this site serves as pages. */
export const PROMOTED_REDIRECTS = ['/overlay/', '/zh-tw/overlay/', '/en/overlay/'];

/** Retired pages whose legacy fragments resolve to different destinations in the browser. */
export const FRAGMENT_REDIRECTS = Object.fromEntries(
  slugPaths('gentoo-mirror-setup').map((path, index) => [path, slugPaths('gentoo-repo-setup')[index]]),
);

/** Redirects outside Hugo's per-page aliases, including the default language's own prefix. */
export const EXTRA_REDIRECTS = ['/zh-cn/', ...Object.keys(FRAGMENT_REDIRECTS)];

/** Hugo addresses of one slug in every locale. */
export function slugPaths(slug) {
  return ['', '/zh-tw', '/en'].map(prefix => (slug === '' ? `${prefix}/` : `${prefix}/${slug}/`));
}

/** Historical XML endpoints have no HTML fallback; the static host applies these exact 301s. */
export const SITEMAP_REDIRECTS = Object.fromEntries(
  ['zh-cn', 'zh-tw', 'en'].map(locale => [`/${locale}/sitemap.xml`, '/sitemap.xml']),
);

/** Directory paths below /files/ serve the browser page, which reads the path from the address bar. */
export const FILES_REWRITES = Object.fromEntries(slugPaths('files').map(path => [`${path}*`, path]));
