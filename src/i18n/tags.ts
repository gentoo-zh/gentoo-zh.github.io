import {CATALOGS, type MessageKey} from './locales';
import {tagSlug} from './routes';

/** The `gz.tag.<slug>` message that names a post tag; a tag without one fails the build rather than show its slug. */
export function tagKey(tag: string): MessageKey {
  const key = `gz.tag.${tagSlug(tag)}`;
  if (!(key in CATALOGS['zh-cn'])) throw new Error(`post tag "${tag}" has no ${key} message`);
  return key as MessageKey;
}

const CJK = /[㐀-鿿豈-﫿]/u;

/** Puts a tag label into a `{tag}` template; the space beside `{tag}` stays only where it separates CJK from Latin text. */
export function fillTag(template: string, label: string): string {
  return template.replace(/(.?)( ?)\{tag\}( ?)(.?)/u, (_, before: string, left: string, right: string, after: string) =>
    before + (CJK.test(before) && CJK.test(label[0] ?? '') ? '' : left) + label
    + (CJK.test(after) && CJK.test(label.at(-1) ?? '') ? '' : right) + after);
}
