import {VStack} from '@astryxdesign/core/Layout';
import {officialMirrorColumns, officialMirrors} from '../../data/mirrors';
import type {Mirrors} from '../../data/schemas';
import type {Locale} from '../../i18n/locales';
import {PostMarkdown} from '../../markdown/PostMarkdown';
import {SPACE} from '../../theme/scale';

const NO_LINKS = new Set<string>();

export function OfficialMirrorTable({locale, mirrors}: {locale: Locale; mirrors: Mirrors}) {
  const headers = Object.values(officialMirrorColumns).map(label => label[locale]);
  const rows = officialMirrors(mirrors).map(mirror => [
    mirror.name[locale],
    mirror.region[locale],
    `\`${mirror.uri}\`${mirror.note?.[locale] ?? ''}`,
    mirror.git == null ? '' : '✓',
    mirror.rsync == null ? '' : '✓',
  ]);
  // Reuse the shared Astryx table renderer's typography and content-based column widths.
  const table = [headers, ['---', '---', '---', ':-:', ':-:'], ...rows].map(cells => `| ${cells.join(' | ')} |`).join('\n');
  return (
    <VStack paddingBlock={SPACE.code}>
      <PostMarkdown locale={locale} pages={NO_LINKS}>{table}</PostMarkdown>
    </VStack>
  );
}
