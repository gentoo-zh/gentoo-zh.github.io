import type {MarkdownExtensionNode, MarkdownSyntaxContribution} from '@astryxdesign/core/Markdown/plugins';
import type {ShortcodeData, ShortcodeDefinition} from './types';

export type ShortcodeNode = MarkdownExtensionNode<'hugo-shortcodes', 'shortcode', {name: string; data: ShortcodeData}, 'block'>;

const MAX_SPAN = 64_000;
// `{{< name a="b" … >}}` or `{{% … %}}`; attributes may sit on their own lines (home-bento).
const OPENING = /^\{\{([<%])\s*([\w/-]+)((?:\s+\w+="[^"]*")*)\s*[>%]\}\}[ \t]*(?:\n|$)/;
const ATTRIBUTE = /(\w+)="([^"]*)"/g;

function attributes(source: string): Record<string, string> {
  return Object.fromEntries([...source.matchAll(ATTRIBUTE)].map(([, key, value]) => [key, value]));
}

/** Block syntax for every registered shortcode; anything unregistered stays text. */
export function shortcodeSyntax(definitions: ReadonlyArray<ShortcodeDefinition>): MarkdownSyntaxContribution<ShortcodeNode> {
  const byName = new Map(definitions.map(definition => [definition.name, definition]));
  const node = (name: string, data: ShortcodeData): ShortcodeNode => ({
    type: 'extension',
    plugin: 'hugo-shortcodes',
    name: 'shortcode',
    display: 'block',
    data: {name, data},
  });
  return {
    startsWith: ['{{<', '{{%'],
    maxSpan: MAX_SPAN,
    tokenize({source, offset, end, isFinal}) {
      const opening = OPENING.exec(source.slice(offset, end));
      const definition = opening == null ? undefined : byName.get(opening[2]);
      if (opening == null || definition == null) {
        return {status: 'no-match'};
      }
      const [head, delimiter, name, attrSource] = opening;
      const attrs = attributes(attrSource);
      if (!definition.isPaired) {
        const data = definition.parse(attrs, '');
        return data === undefined ? {status: 'no-match'} : {status: 'match', end: offset + head.length, node: node(name, data)};
      }
      const closing = new RegExp(`\\n\\{\\{${delimiter}\\s*/${name}\\s*[>%]\\}\\}`, 'g');
      closing.lastIndex = offset + head.length - 1;
      const close = closing.exec(source);
      if (close == null || close.index + close[0].length > end) {
        return isFinal ? {status: 'no-match'} : {status: 'defer'};
      }
      const data = definition.parse(attrs, source.slice(offset + head.length, close.index));
      return data === undefined ? {status: 'no-match'} : {status: 'match', end: close.index + close[0].length, node: node(name, data)};
    },
  };
}
