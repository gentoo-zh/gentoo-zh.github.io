import {parseMarkdownAst, type MarkdownAstBlockContent, type MarkdownAstPhrasingContent} from '@astryxdesign/core/Markdown/parser';
import type {MarkdownExtensionNode} from '@astryxdesign/core/Markdown/plugins';
import {explicitId, headingAnchors, type AnchorNode} from './headingAnchors';
import {outlineItems} from './outline';

type Block = MarkdownAstBlockContent<MarkdownExtensionNode>;
type Phrasing = MarkdownAstPhrasingContent<MarkdownExtensionNode>;

/** A `##` heading that opens a page: its text starts with the section number, as in `## 3. Boot`. */
const NUMBERED = /^(\d+)\.\s/;

export interface PostPage {
  /** Its place in the URL, the number its heading starts with; 0 is the overview at the post's own address. */
  number: number;
  /** The `## N.` heading's id in the whole post, which the page title carries; absent on the overview. */
  id?: string;
  /** The `## N.` heading's text; absent on the overview. */
  title?: string;
  /** The page's Markdown without its own heading; every other heading carries its whole-post id as `{#id}`. */
  body: string;
  /** The page's top-level `###` headings in order, with their whole-post ids and outline labels. */
  sections: PageSection[];
}

/** A `###` heading on a page, as the page list links it. */
export interface PageSection {
  id: string;
  label: string;
}

export interface PostPages {
  /** The overview first, then the numbered sections in order. */
  pages: PostPage[];
  /** The page number of every heading id in the post. */
  pageOf: ReadonlyMap<string, number>;
}

/** Front matter `paged.groups`: a sidebar heading and the section number it starts at. */
export interface PageGroupSpec {
  title: string;
  from: number;
}

export interface PageGroup {
  /** Absent for the sections listed before the first group. */
  title?: string;
  pages: PostPage[];
}

function anchored(body: string) {
  return headingAnchors(parseMarkdownAst(body), {source: body, isFinal: true, display: 'block', report: () => {}});
}

/** The heading ids in a block, in the order headingAnchors assigns them (quotes and list items included). */
function headingIds(node: Block): string[] {
  switch (node.type) {
    case 'heading':
      return [(node.children[0] as unknown as AnchorNode).data.id];
    case 'blockquote':
      return node.children.flatMap(headingIds);
    case 'list':
      return node.children.flatMap(item => item.children.flatMap(headingIds));
    default:
      return [];
  }
}

/**
 * A post cut into pages at its numbered top-level headings (`## 3. …`), on the same parse as the outline, so
 * a `##` line in a fence never cuts. Everything before the first numbered heading is the overview; an
 * unnumbered `##` after one stays on the page before it. Ids are assigned once on the whole body and
 * written into each page as `{#id}`, so a heading keeps its whole-post id on its page.
 */
export function splitPages(body: string): PostPages {
  const raw = parseMarkdownAst(body).children as Block[];
  const ids = (anchored(body).children as Block[]).map(headingIds);
  const outline = outlineItems(body);
  const titles = new Map(outline.filter(item => item.level === 2).map(item => [item.id, item.label]));
  const range = (index: number) => {
    const {start, end} = raw[index].position ?? {};
    if (start?.offset == null || end?.offset == null) throw new Error('splitPages: block without a source offset');
    return {start: start.offset, end: end.offset};
  };
  const starts = raw.flatMap((node, index) => {
    if (node.type !== 'heading' || node.depth !== 2) return [];
    const title = titles.get(ids[index][0]) ?? '';
    const match = NUMBERED.exec(title);
    return match == null ? [] : [{index, number: Number(match[1]), title}];
  });
  if (starts.length === 0) throw new Error('splitPages: a paged post needs at least one numbered ## heading, such as "## 1. …"');
  starts.forEach(({number, title}, at) => {
    if (number < 1 || (at > 0 && number <= starts[at - 1].number)) throw new Error(`splitPages: "${title}" breaks the rising section numbers`);
  });

  const pageOf = new Map<string, number>();
  const segments = [{index: -1, number: 0, title: undefined as string | undefined}, ...starts];
  const pages = segments.map(({index: first, number, title}, at): PostPage => {
    const from = Math.max(first, 0);
    const to = at + 1 < segments.length ? segments[at + 1].index : raw.length;
    const sourceStart = first < 0 ? 0 : range(first).start;
    const sourceEnd = to < raw.length ? range(to).start : body.length;
    const id = first < 0 ? undefined : ids[first][0];
    // Edits run back to front so earlier offsets stay valid: drop the page's own heading, which becomes
    // the page title, and pin every other top-level heading's id.
    const edits: Array<{at: number; end: number; text: string}> = [];
    for (let index = from; index < to; index++) {
      ids[index].forEach(heading => pageOf.set(heading, number));
      const node = raw[index];
      if (node.type !== 'heading') continue;
      const {start, end} = range(index);
      if (index === first) edits.push({at: start, end, text: ''});
      else if (!/^#/.test(body.slice(start, end))) throw new Error(`splitPages: setext heading #${ids[index][0]} is not supported; write it with #`);
      else if (explicitId(node.children as Phrasing[]) == null) edits.push({at: end, end, text: ` {#${ids[index][0]}}`});
    }
    let text = body.slice(sourceStart, sourceEnd);
    for (const edit of edits.sort((a, b) => b.at - a.at)) {
      text = text.slice(0, edit.at - sourceStart) + edit.text + text.slice(edit.end - sourceStart);
    }
    // Headings inside quotes or list items carry no offset; check that they still get the whole-post ids.
    const expected = ids.slice(from, to).flat().filter(heading => heading !== id);
    const actual = (anchored(text).children as Block[]).flatMap(headingIds);
    if (actual.join('\n') !== expected.join('\n')) throw new Error(`splitPages: page ${number} heading ids differ from the whole post`);
    const sections = outline.filter(item => item.level === 3 && pageOf.get(item.id) === number).map(item => ({id: item.id, label: item.label}));
    return {number, id, title, body: text, sections};
  });
  return {pages, pageOf};
}

/**
 * The numbered pages under their sidebar groups. Sections before the first group come first, ungrouped; a
 * group that starts at no section fails the build.
 */
export function pageGroups({pages}: PostPages, groups: ReadonlyArray<PageGroupSpec> = []): PageGroup[] {
  const numbered = pages.filter(page => page.number > 0);
  const cuts = groups.map(group => {
    const at = numbered.findIndex(page => page.number === group.from);
    if (at < 0) throw new Error(`paged.groups: "${group.title}" starts at section ${group.from}, which the post does not have`);
    return at;
  });
  if (cuts.some((at, index) => index > 0 && at <= cuts[index - 1])) throw new Error('paged.groups: groups must start at rising sections');
  const lead = numbered.slice(0, cuts[0] ?? numbered.length);
  return [
    ...(lead.length > 0 ? [{pages: lead}] : []),
    ...groups.map((group, index) => ({title: group.title, pages: numbered.slice(cuts[index], cuts[index + 1] ?? numbered.length)})),
  ];
}

/**
 * Where a `#fragment` link on page `current` points: the same page when the heading is on it, otherwise the
 * page that holds it. A fragment that names no heading, or does not decode, fails the build.
 */
export function pageHashResolver({pageOf}: PostPages, current: number, pageHref: (number: number) => string) {
  return (fragment: string): string => {
    let id: string;
    try {
      id = decodeURIComponent(fragment);
    } catch {
      throw new Error(`#${fragment} is not a valid percent-encoded fragment`);
    }
    const number = pageOf.get(id);
    if (number == null) throw new Error(`#${fragment} names no heading in this post`);
    return number === current ? `#${fragment}` : `${pageHref(number)}#${fragment}`;
  };
}
