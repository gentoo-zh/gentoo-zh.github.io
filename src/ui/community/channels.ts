// Shared channel destinations; localized labels live under gz.channels.<id>.
import type {ComponentType, SVGProps} from 'react';
import type {Locale} from '../../i18n/locales';
import {SITE} from '../../site';
import {DiscourseLogo, MatrixLogo, TelegramLogo} from '../chrome/channelLogos';
import {BookOpen, Bug, GitHubLogo, Hash, Layers, Mail, Megaphone, MessageCircle} from '../chrome/icons';

export type ChannelPlatform = 'telegram' | 'matrix' | 'irc';

interface Join {
  /** Platform and handle shown in the link, e.g. `Telegram @gentoo_zh`. */
  label: string;
  platform?: ChannelPlatform;
  handle?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** One address, or one per locale where the target has localized pages. */
  href: string | Record<Locale, string>;
}
export interface Channel extends Record<string, unknown> {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  join: Join[];
}
export type ChannelGroup = 'groups' | 'feeds' | 'other';

const tg = (name: string): Join => ({platform: 'telegram', handle: `@${name}`, icon: TelegramLogo, label: `Telegram @${name}`, href: `https://telegram.me/${name}`});
const mx = (room: string): Join => ({platform: 'matrix', handle: `#${room}`, icon: MatrixLogo, label: `Matrix #${room}`, href: `https://matrix.to/#/%23${room}:matrix.gentoozh.org`});
const irc = (room: string): Join => ({platform: 'irc', handle: `#${room}`, icon: Hash, label: `IRC #${room}`, href: `https://web.libera.chat/#${room}`});

export const CHANNELS: Record<ChannelGroup, Channel[]> = {
  groups: [
    {id: 'main', icon: MessageCircle, join: [tg('gentoo_zh'), mx('gentoo-zh'), irc('gentoo-zh')]},
    {id: 'offtopic', icon: MessageCircle, join: [tg('talk_something'), mx('talk_something'), irc('gentoo-zh-offtopic')]},
    {id: 'ops', icon: MessageCircle, join: [tg('gentoo_zh_ops'), mx('gentoo_zh_ops')]},
    {id: 'space', icon: Layers, join: [mx('gentoo')]},
  ],
  feeds: [
    {id: 'announce', icon: Megaphone, join: [tg('gentoocn'), mx('gentoocn')]},
    {id: 'tc', icon: Megaphone, join: [tg('gentootw'), mx('gentootw')]},
    {id: 'bugZh', icon: Bug, join: [tg('GentoozhBug'), mx('gentoo-zh-bug')]},
    {id: 'bugEn', icon: Bug, join: [tg('GentooBug'), mx('gentoo-bug')]},
  ],
  other: [
    {id: 'forum', icon: DiscourseLogo, join: [{icon: DiscourseLogo, label: 'forum.gentoozh.org', href: 'https://forum.gentoozh.org/'}]},
    {
      id: 'github',
      icon: GitHubLogo,
      join: [
        {icon: GitHubLogo, label: 'gentoo-zh', href: 'https://github.com/gentoo-zh'},
        {icon: GitHubLogo, label: 'gentoo-zh/overlay', href: 'https://github.com/gentoo-zh/overlay/issues'},
      ],
    },
    {
      id: 'wiki',
      icon: BookOpen,
      join: [
        {
          icon: BookOpen,
          label: 'gentoo-zh',
          href: SITE.wiki,
        },
      ],
    },
    {id: 'mail', icon: Mail, join: [{icon: Mail, label: 'zakk@gentoozh.org', href: 'mailto:zakk@gentoozh.org'}]},
  ],
};
