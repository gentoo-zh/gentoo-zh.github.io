// Old addresses of retired posts and their redirect targets; importers run with type stripping.
import {DEFAULT_LOCALE} from '../../src/i18n/localeCodes.ts';
import {RETIRED_POSTS} from '../../src/content/retiredPosts.ts';

/** Old post path to the path its permanent redirect points at. */
export const RETIRED_REDIRECTS = Object.fromEntries(
  Object.entries(RETIRED_POSTS).flatMap(([locale, posts]) =>
    Object.entries(posts).map(([slug, to]) => [`${locale === DEFAULT_LOCALE ? '' : `/${locale}`}/posts/${slug}/`, to]),
  ),
);
