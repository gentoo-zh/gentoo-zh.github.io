import {LOCALES} from '../../i18n/locales';
import {splitPages, type PageGroupSpec, type PostPages} from '../../markdown/chapters';
import {getPosts, type Post} from '../../content/posts';

export interface PagedPost {
  post: Post;
  split: PostPages;
  groups: PageGroupSpec[];
}

/** A post read in pages (front matter `paged`), cut at its numbered headings; null for a single-page post. */
export function pagedPost(post: Post): PagedPost | null {
  const {paged} = post.data;
  if (paged == null) return null;
  return {post, split: splitPages(post.body ?? ''), groups: paged === true ? [] : paged.groups};
}

/**
 * Every paged post in every locale. The locales of a post must share their section numbers, so a section's
 * address and the language switch land on the same section; the build fails otherwise.
 */
export async function pagedPosts(): Promise<PagedPost[]> {
  const all = (await Promise.all(LOCALES.map(getPosts))).flat().flatMap(post => pagedPost(post) ?? []);
  const numbers = new Map<string, Set<string>>();
  for (const {post, split} of all) {
    const key = split.pages.map(page => page.number).join(', ');
    numbers.set(post.data.slug, (numbers.get(post.data.slug) ?? new Set()).add(key));
  }
  for (const [slug, keys] of numbers) {
    if (keys.size > 1) throw new Error(`posts/${slug}: locales number their sections differently (${[...keys].join(' / ')})`);
  }
  return all;
}
