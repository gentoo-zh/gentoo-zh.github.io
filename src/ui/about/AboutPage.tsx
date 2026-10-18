import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {distfilesLink} from '../../i18n/distfilesLink';
import type {MessageKey} from '../../i18n/locales';
import {useMessage} from '../../i18n/useMessage';
import {ICON} from '../../theme/scale';
import {SectionPage, type SectionPageProps} from '../section/SectionPage';

interface Row {
  id: string;
  /** What the row points at, shown under its label. */
  detail: string;
  href: string;
}

const CONTACT: Row[] = [
  {id: 'issues', detail: 'github.com/gentoo-zh/binhost/issues', href: 'https://github.com/gentoo-zh/binhost/issues'},
  {id: 'forum', detail: 'forum.gentoozh.org', href: 'https://forum.gentoozh.org/'},
  {id: 'chat', detail: 'Telegram @gentoo_zh', href: 'https://telegram.me/gentoo_zh'},
  {id: 'announce', detail: 'Telegram @gentoocn', href: 'https://telegram.me/gentoocn'},
  {id: 'matrix', detail: 'Matrix #gentoo-zh:matrix.gentoozh.org', href: 'https://matrix.to/#/%23gentoo-zh:matrix.gentoozh.org'},
  {id: 'mail', detail: 'zakk@gentoozh.org', href: 'mailto:zakk@gentoozh.org'},
];
const LINKS: Row[] = [
  {id: 'binhost', detail: 'github.com/gentoo-zh/binhost', href: 'https://github.com/gentoo-zh/binhost'},
  {id: 'key', detail: 'gentoo-zh-binhost.asc', href: 'https://distfiles.gentoozh.org/gentoo-zh-binhost.asc'},
  {id: 'overlay', detail: 'github.com/gentoo-zh/overlay', href: 'https://github.com/gentoo-zh/overlay'},
  {id: 'site', detail: 'github.com/gentoo-zh/gentoo-zh.github.io', href: 'https://github.com/gentoo-zh/gentoo-zh.github.io'},
];

function Rows({id, rows}: {id: string; rows: Row[]}) {
  const t = useMessage();
  return (
    <List density="compact" hasDividers edgeCompensation="inline">
      {rows.map(row => {
        // Download-site files read as part of this site.
        const isExternal = row.href.startsWith('https:') && !distfilesLink(row.href);
        return (
          <ListItem
            key={row.id}
            label={t(`gz.about.${id}.${row.id}` as MessageKey)}
            description={row.detail}
            href={row.href}
            target={isExternal ? '_blank' : undefined}
            endContent={<Icon icon={isExternal ? 'externalLink' : 'chevronRight'} size={ICON.inline} color="secondary" />}
          />
        );
      })}
    </List>
  );
}

export function AboutPage(page: Omit<SectionPageProps, 'slots' | 'children'> & {body: string}) {
  return <SectionPage {...page} slots={{contact: <Rows id="contact" rows={CONTACT} />, links: <Rows id="links" rows={LINKS} />}} />;
}
