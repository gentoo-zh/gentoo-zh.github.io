// The packages page's status reference: status names in its Markdown render as the table's tokens.
import {Token} from '@astryxdesign/core/Token';
import type {Locale, MessageKey} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {SectionPage} from '../section/SectionPage';
import {MARK_COLOR, STATUS_COLOR, STATUSES, type TokenColor} from './packagesData';

export interface PackageStatusPageProps {
  locale: Locale;
  title: string;
  description?: string;
  body: string;
  pages: ReadonlySet<string>;
}

export function PackageStatusPage({locale, title, description, body, pages}: PackageStatusPageProps) {
  const t = useMessage();
  const colors = new Map<string, TokenColor>([
    ...STATUSES.map(status => [t(`gz.packages.status.${status}` as MessageKey), STATUS_COLOR[status]] as const),
    [t('gz.packages.status.license'), MARK_COLOR.policy],
    [t('gz.packages.status.bindist'), MARK_COLOR.policy],
    [t('gz.packages.status.removed'), MARK_COLOR.removed],
  ]);
  const renderInlineCode = (text: string) => {
    const color = colors.get(text);
    return color == null ? undefined : <Token color={color} label={text} />;
  };
  return <SectionPage locale={locale} section="download" title={title} description={description} body={body} pages={pages} renderInlineCode={renderInlineCode} />;
}
