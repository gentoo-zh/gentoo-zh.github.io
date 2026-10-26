import type {
  MarkdownAstBlockContent,
  MarkdownAstHeading,
  MarkdownAstPhrasingContent,
  MarkdownAstRoot,
} from '@astryxdesign/core/Markdown/parser';
import type {MarkdownExtensionNode, MarkdownTransform} from '@astryxdesign/core/Markdown/plugins';

export type AnchorNode = MarkdownExtensionNode<'heading-anchors', 'anchor', {id: string}, 'inline'>;

type Block = MarkdownAstBlockContent<MarkdownExtensionNode>;
type Phrasing = MarkdownAstPhrasingContent<MarkdownExtensionNode>;

const EXPLICIT_ID = /\s*\{#([^}\s]+)\}\s*$/;

function plainText(nodes: ReadonlyArray<Phrasing>): string {
  return nodes
    .map(node => {
      if (node.type === 'text' || node.type === 'inlineCode') {
        return node.value;
      }
      return 'children' in node ? plainText(node.children as ReadonlyArray<Phrasing>) : '';
    })
    .join('');
}

/** Hugo's GitHub-style anchor: keep letters, digits, `_`; spaces and `-` become `-`; drop the rest. */
export function hugoAnchor(text: string): string {
  let id = '';
  for (const char of text.trim()) {
    if (char === ' ' || char === '-') {
      id += '-';
    } else if (/[\p{L}\p{N}_]/u.test(char)) {
      id += char.toLowerCase();
    }
  }
  return id;
}

function stripExplicitId(children: ReadonlyArray<Phrasing>): {children: Phrasing[]; id?: string} {
  const last = children.at(-1);
  const match = last?.type === 'text' ? EXPLICIT_ID.exec(last.value) : null;
  if (last?.type !== 'text' || match == null) {
    return {children: [...children]};
  }
  const rest = last.value.slice(0, match.index);
  return {children: [...children.slice(0, -1), ...(rest ? [{...last, value: rest}] : [])], id: match[1]};
}

/** The id a heading's own `{#id}` sets, if it has one. */
export function explicitId(children: ReadonlyArray<Phrasing>): string | undefined {
  return stripExplicitId(children).id;
}

/**
 * Gives every heading the id Hugo gave it (an explicit `{#id}` or the anchor of its text),
 * carried by a leading anchor node that the post's heading renderer reads and puts on the
 * heading itself. The anchor has no text form, so it never leaks into heading labels.
 *
 * Ids follow Hugo's id factory in document order: an explicit id is taken as written and
 * reserved; a generated one falls back to `heading` when empty and takes the first free
 * `-1`, `-2`, … suffix.
 */
export const headingAnchors: MarkdownTransform<AnchorNode> = (root: MarkdownAstRoot<MarkdownExtensionNode>) => {
  const used = new Set<string>();
  const reserve = (id: string): string => {
    used.add(id);
    return id;
  };
  const unique = (base: string): string => {
    let id = base;
    for (let suffix = 1; used.has(id); suffix++) {
      id = `${base}-${suffix}`;
    }
    return reserve(id);
  };

  const heading = (node: MarkdownAstHeading<MarkdownExtensionNode>): Block => {
    const {children, id} = stripExplicitId(node.children);
    const anchor: AnchorNode = {
      type: 'extension',
      plugin: 'heading-anchors',
      name: 'anchor',
      display: 'inline',
      data: {id: id == null ? unique(hugoAnchor(plainText(children)) || 'heading') : reserve(id)},
    };
    return {...node, children: [anchor, ...children]} as Block;
  };

  const block = (node: Block): Block => {
    switch (node.type) {
      case 'heading':
        return heading(node);
      case 'blockquote':
        return {...node, children: node.children.map(block)} as Block;
      case 'list':
        return {...node, children: node.children.map(item => ({...item, children: item.children.map(block)}))} as Block;
      default:
        return node;
    }
  };

  return {...root, children: root.children.map(block)};
};
