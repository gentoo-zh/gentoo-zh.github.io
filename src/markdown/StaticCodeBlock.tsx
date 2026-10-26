import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@astryxdesign/core/theme/tokens.stylex';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {SPACE} from '../theme/scale';
import {codeTitle} from './codeTitle';
import {codeTokenizer} from './codeTokenizer';

// Adapted from the Astryx docsite's components/docs/CodeBlock.tsx (MIT, Meta Platforms, Inc.).
// Static HTML needs the syntax background normally injected on the client.
// Collapse has no handler here; CopyCode.astro handles copying.
const styles = stylex.create({
  syntax: {'--color-syntax-background': colorVars['--color-background-muted']},
});

export function StaticCodeBlock({code, language, title}: {code: string; language?: string; title?: string}) {
  const snippet = codeTitle(code);
  const block = (
    <CodeBlock
      code={snippet.code}
      title={snippet.title}
      language={language}
      highlightMode="spans"
      tokenizer={codeTokenizer}
      hasLanguageLabel={snippet.title == null}
      width="100%"
      hasCopyButton
      isCollapsible={false}
    />
  );
  return (
    <div {...stylex.props(styles.syntax)}>
    <VStack gap={SPACE.hairline}>
      {title == null || title === '' ? null : (
        <Text type="supporting" color="secondary">
          {title}
        </Text>
      )}
      {block}
    </VStack>
    </div>
  );
}
