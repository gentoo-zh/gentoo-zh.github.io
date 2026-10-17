import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {StaticCodeBlock} from '../StaticCodeBlock';
import {defineShortcode} from './types';
import {SPACE} from '../../theme/scale';

const SINGLE_FENCE = /^(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n\1[ \t]*$/;

type DetailsData = {kind: 'code'; title: string; language: string; code: string} | {kind: 'markdown'; title: string; body: string};

/**
 * `{{% details title="…" %}}`, always expanded: pages ship no script for content, so a
 * disclosure control would do nothing. A body that is one fenced block becomes a titled
 * CodeBlock; any other body is a Card with the title above the rendered Markdown.
 */
export const details = defineShortcode<DetailsData>({
  name: 'details',
  isPaired: true,
  parse: (attrs, body) => {
    if (attrs.title == null) {
      return undefined;
    }
    const fence = SINGLE_FENCE.exec(body.trim());
    if (fence != null) {
      const language = fence[2].trim().split(/\s+/, 1)[0] || 'plaintext';
      return {kind: 'code', title: attrs.title, language, code: fence[3]};
    }
    return {kind: 'markdown', title: attrs.title, body: body.trim()};
  },
  render: (data, context) =>
    data.kind === 'code' ? (
      <StaticCodeBlock title={data.title} language={data.language} code={data.code} />
    ) : (
      <Card padding={SPACE.block}>
        <VStack gap={SPACE.inline}>
          <Text type="large" weight="semibold">
            {data.title}
          </Text>
          {context.renderMarkdown(data.body)}
        </VStack>
      </Card>
    ),
  toText: data => (data.kind === 'code' ? data.code : data.body),
});
