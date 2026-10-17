import type {MarkdownExtensionNode, MarkdownSyntaxContribution} from '@astryxdesign/core/Markdown/plugins';

/** The raw inline HTML posts use; Astryx Markdown renders raw HTML as text. */
export type InlineHtmlNode = MarkdownExtensionNode<'inline-html', 'span', {tag: 'del' | 'small'; text: string}, 'inline'>;

const ELEMENT = /^<(del|small)>([^<]*)<\/\1>/;

export const inlineHtmlSyntax: MarkdownSyntaxContribution<InlineHtmlNode> = {
  startsWith: ['<del>', '<small>'],
  maxSpan: 1_000,
  tokenize({source, offset, end}) {
    const match = ELEMENT.exec(source.slice(offset, end));
    if (match == null) {
      return {status: 'no-match'};
    }
    return {
      status: 'match',
      end: offset + match[0].length,
      node: {type: 'extension', plugin: 'inline-html', name: 'span', display: 'inline', data: {tag: match[1] as 'del' | 'small', text: match[2]}},
    };
  },
};
