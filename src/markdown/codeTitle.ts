import type {MarkdownAstBlockContent} from '@astryxdesign/core/Markdown/parser';
import type {MarkdownExtensionNode, MarkdownTransform} from '@astryxdesign/core/Markdown/plugins';

// Absolute or home paths, or a relative path with at least one directory (`.github/x.toml`).
const FILE_PATH = /^(?:\/|~\/|\.?[\w-]+\/)[^\s:]+$/;

function filePath(text: string): string | undefined {
  const path = text.trim().replace(/:$/, '');
  return FILE_PATH.test(path) ? path : undefined;
}

/** A file comment supplies the header; the remaining string is both shown and copied. */
export function codeTitle(code: string): {code: string; title?: string} {
  const first = /^[ \t]*(?:#|\/\/)[ \t]+([^\r\n]*)(?:\r?\n|$)/.exec(code);
  if (first == null) return {code};
  const title = filePath(first[1]!);
  return title == null ? {code} : {code: code.slice(first[0].length), title};
}

type Block = MarkdownAstBlockContent<MarkdownExtensionNode>;

/** Accept a standalone inline-code filename caption before a fence. */
export const fileCodeTitles: MarkdownTransform = root => {
  const blocks = (nodes: ReadonlyArray<Block>): Block[] => {
    const result: Block[] = [];
    for (const node of nodes) {
      const caption = result.at(-1);
      if (node.type === 'code' && caption?.type === 'paragraph') {
        const [path, suffix] = caption.children;
        const title = path?.type === 'inlineCode' && caption.children.length <= 2 &&
          (suffix == null || (suffix.type === 'text' && /^\s*[:：]?\s*$/.test(suffix.value)))
          ? filePath(path.value) : undefined;
        if (title != null && codeTitle(node.value).title == null) {
          result.pop();
          result.push({...node, value: `# ${title}\n${node.value}`});
          continue;
        }
      }
      if (node.type === 'blockquote') result.push({...node, children: blocks(node.children)});
      else if (node.type === 'list') result.push({...node, children: node.children.map(item => ({...item, children: blocks(item.children)}))});
      else result.push(node);
    }
    return result;
  };
  return {...root, children: blocks(root.children)};
};
