const SCHEME = /^[a-z][a-z\d+.-]*:/i;

/** `value` (attribute-escaped) resolved against `page`, unless it is a fragment or already absolute. */
function absolute(value: string, page: URL): string {
  return value.startsWith('#') || SCHEME.test(value) ? value : new URL(value.replaceAll('&amp;', '&'), page).href.replaceAll('&', '&amp;');
}

/**
 * Feed HTML: page and image URLs absolute against `page`, `srcset` candidates included; styles and the site's
 * image-variant mark dropped. `sizes` stays beside a `srcset`, so readers pick the candidate the page would, and
 * goes where there is none, since it means nothing there.
 */
export function feedHtml(html: string, page: URL): string {
  return html.replace(/<[a-z][^>]*>/gi, tag => {
    tag = tag.replace(/\s(?:class|style|data-image-widths)="[^"]*"/g, '');
    if (!/\ssrcset="/.test(tag)) tag = tag.replace(/\ssizes="[^"]*"/g, '');
    return tag
      .replace(/\s(href|src)="([^"]*)"/g, (_, name: string, value: string) => ` ${name}="${absolute(value, page)}"`)
      .replace(/\ssrcset="([^"]*)"/g, (_, value: string) =>
        ` srcset="${value
          .split(',')
          .map(candidate => candidate.trim().replace(/^\S+/, url => absolute(url, page)))
          .join(', ')}"`,
      );
  });
}
