import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {HStack} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {Text} from '@astryxdesign/core/Text';
import {ICON, SPACE} from '../theme/scale';

const styles = stylex.create({
  summary: {
    cursor: 'pointer',
    minHeight: 'var(--size-element-md)',
    paddingInline: spacingVars['--spacing-3'],
    borderWidth: 'var(--border-width)',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-element)',
    listStyle: 'none',
    '::-webkit-details-marker': {display: 'none'},
  },
});

/** The bordered label row that opens a native `<details>`; needs no script. */
export function DisclosureSummary({label}: {label: string}) {
  return (
    <HStack as="summary" align="center" justify="between" gap={SPACE.tight} xstyle={styles.summary}>
      <Text type="label">{label}</Text>
      <Icon icon="chevronDown" size={ICON.inline} color="secondary" />
    </HStack>
  );
}
