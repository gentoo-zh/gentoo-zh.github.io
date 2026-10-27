import {parseMarkdownAst, type MarkdownAstPhrasingContent} from '@astryxdesign/core/Markdown/parser';
import type {OutlineItem} from '@astryxdesign/core/Outline';
import type {MarkdownExtensionNode} from '@astryxdesign/core/Markdown/plugins';
import {headingAnchors, type AnchorNode} from './headingAnchors';

type Phrasing = MarkdownAstPhrasingContent<MarkdownExtensionNode>;

function text(nodes: ReadonlyArray<Phrasing>): string {
  return nodes
    .map(node => {
      if (node.type === 'text' || node.type === 'inlineCode') return node.value;
      return 'children' in node ? text(node.children as ReadonlyArray<Phrasing>) : '';
    })
    .join('')
    .trim();
}

/**
 * The page's h2 through h4, for the "On this page" rail: the same parse and the same Hugo ids as
 * the rendered headings (headingAnchors), so every entry lands on its heading.
 */
export function outlineItems(body: string): OutlineItem[] {
  const root = headingAnchors(parseMarkdownAst(body), {source: body, isFinal: true, display: 'block', report: () => {}});
  const items: OutlineItem[] = [];
  for (const node of root.children) {
    if (node.type !== 'heading' || (node.depth < 2 || node.depth > 4)) continue;
    const [anchor, ...rest] = node.children as Phrasing[];
    const id = (anchor as unknown as AnchorNode | undefined)?.data?.id;
    if (id == null) continue;
    items.push({id, label: text(rest), level: node.depth});
  }
  return items;
}

/**
 * A heading's level on a section page of a paged post, whose `## N.` heading is the page title (h1): `###`
 * and deeper move up one so the page's sections are its h2s; an unnumbered `##` left on the page stays h2.
 */
export function promotedLevel<Level extends number>(level: Level): Level {
  return (level > 2 ? level - 1 : level) as Level;
}
