/** Old distfiles.gentoozh.org pages that now live on this site under the same slug. */
const PAGES = ['packages', 'faq', 'status', 'about', 'iso', 'logo', 'overlay', 'thanks', 'binpkg-setup', 'distfiles-setup'];

const HOST = /^https?:\/\/distfiles\.gentoozh\.org(?=[/?#]|$)/;

/** An in-site zh-cn path (the caller localizes it), or a file the download site still serves. */
export type DistfilesLink = {kind: 'page'; path: string} | {kind: 'file'; url: string};

/**
 * Where a distfiles.gentoozh.org link points now, following that host's nginx table for
 * browsers: directories go to `/files/<dir>/`, the old pages to their slug here. `?lang=` is
 * dropped because the reader's locale decides; other queries and the fragment are kept.
 * Null for any other host.
 */
export function distfilesLink(href: string): DistfilesLink | null {
  if (!HOST.test(href)) return null;
  const url = new URL(href);
  url.searchParams.delete('lang');
  const suffix = `${url.search}${url.hash}`;
  const {pathname} = url;
  const page = /^\/([\w-]+)(?:\.html)?$/.exec(pathname)?.[1];
  if (pathname === '/' || page === 'index') return {kind: 'page', path: `/files/${suffix}`};
  if (page === 'mirrors' || page === 'mirror') return {kind: 'page', path: `/mirrorlist/${suffix}`};
  if (page && PAGES.includes(page)) return {kind: 'page', path: `/${page}/${suffix}`};
  if (pathname.endsWith('/')) return {kind: 'page', path: `${pathname.startsWith('/files/') ? '' : '/files'}${pathname}${suffix}`};
  return {kind: 'file', url: href};
}
