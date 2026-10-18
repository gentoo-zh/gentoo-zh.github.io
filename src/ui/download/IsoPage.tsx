// Static download blocks fill the slots in content/<locale>/{iso,official-media}/_index.md.
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {List, ListItem} from '@astryxdesign/core/List';
import {Text} from '@astryxdesign/core/Text';
import type {Mirrors} from '../../data/schemas';
import {officialMediaMirrors} from '../../data/mirrors';
import type {Locale, MessageKey} from '../../i18n/locales';
import {routes} from '../../i18n/routes';
import {useMessage} from '../../i18n/useMessage';
import {StaticCodeBlock} from '../../markdown/StaticCodeBlock';
import {BUTTON, SPACE} from '../../theme/scale';
import {GuidePage, GuideProcedure, type GuidePageProps} from '../start/GuidePage';
import {Download as DownloadGlyph, GitHubLogo} from '../chrome/icons';

const REPO = 'https://github.com/gentoo-zh/gentoo-cjk-livecd';
const RELEASES = `${REPO}/releases`;
const MAC_POST = '2025-10-02-gentoo-m-series-mac';

/** A mirror row: `uri` is the address shown, `href` overrides where the button goes. */
interface Site {
  id: string;
  uri: string;
  href?: string;
}

/**
 * Every gentoo-zh distfiles mirror in data/gz_mirrors.yaml carries gentoo-cjk-livecd under the
 * same path; origin first, browsed on this site's files page. Names are gz.mirror.name.<id>,
 * shared with the mirror list.
 */
function isoMirrors(mirrors: Mirrors, locale: Locale): Site[] {
  const sites = [...mirrors.dist.filter(mirror => mirror.origin), ...mirrors.dist.filter(mirror => !mirror.origin)];
  return sites.map(mirror => ({
    id: mirror.origin ? 'origin' : mirror.source,
    uri: `${mirror.uri.replace(/\/$/, '')}/gentoo-cjk-livecd/`,
    href: mirror.origin ? `${routes.page(locale, 'files')}gentoo-cjk-livecd/` : undefined,
  }));
}

/** Official media under `releases/amd64/autobuilds/` of any Gentoo mirror. */
const OFFICIAL = [
  {id: 'minimal', dir: 'current-install-amd64-minimal/', files: ['install-amd64-minimal-*.iso', '.DIGESTS']},
  {id: 'livegui', dir: 'current-livegui-amd64/', files: ['livegui-amd64-*.iso']},
  {id: 'stage3', dir: 'current-stage3-amd64-*/', files: ['stage3-amd64-*.tar.xz', '.DIGESTS']},
] as const;

const download = <Icon icon={DownloadGlyph} />;

function MirrorList({sites}: {sites: Site[]}) {
  const t = useMessage();
  return (
    <List density="compact" hasDividers edgeCompensation="inline">
      {sites.map(mirror => (
        <ListItem
          key={mirror.id}
          label={<Text>{t(`gz.mirror.name.${mirror.id}` as MessageKey)}</Text>}
          description={
            <Text type="supporting" color="secondary">
              {mirror.uri.replace(/^https:\/\//, '')}
            </Text>
          }
          endContent={
            <Button variant="secondary" size={BUTTON.inline} label={t('gz.download.iso.open')} href={mirror.href ?? mirror.uri} icon={download} />
          }
        />
      ))}
    </List>
  );
}

function OfficialList() {
  const t = useMessage();
  return (
    <List hasDividers edgeCompensation="inline">
      {OFFICIAL.map(media => (
        <ListItem
          key={media.id}
          label={t(`gz.download.iso.official.${media.id}.name` as MessageKey)}
          description={
            <VStack gap={SPACE.hairline}>
              <Text type="supporting" color="secondary">
                {t(`gz.download.iso.official.${media.id}.desc` as MessageKey)}
              </Text>
              <HStack gap={SPACE.hairline} wrap="wrap">
                {[media.dir, ...media.files].map(path => (
                  <Code key={path}>{path}</Code>
                ))}
              </HStack>
            </VStack>
          }
        />
      ))}
    </List>
  );
}

type Props = Omit<GuidePageProps, 'slots'> & {mirrors: Mirrors};

export function IsoPage({mirrors, ...page}: Props) {
  const t = useMessage();
  const {locale} = page;
  const sites = isoMirrors(mirrors, locale);
  const step = (key: string, code?: string) => ({
    title: t(`gz.download.iso.${key}.label` as MessageKey),
    description: t(`gz.download.iso.${key}.desc` as MessageKey),
    body: code == null ? null : <StaticCodeBlock code={code} language="bash" />,
  });

  const slots = {
    mac: (
      <Banner
        status="info"
        title={t('gz.download.iso.mac.title')}
        description={t('gz.download.iso.mac.desc')}
        endContent={
          <Button
            variant="secondary"
            size={BUTTON.inline}
            label={t('gz.download.iso.mac.guide')}
            href={routes.post(locale, MAC_POST)}
          />
        }
      />
    ),
    download: (
      <VStack id="live-iso" gap={SPACE.block}>
        <HStack gap={SPACE.inline} wrap="wrap">
          <Button variant="secondary" size={BUTTON.cta} label={t('gz.download.iso.releases')} href={RELEASES} icon={<GitHubLogo />} />
          <Button variant="secondary" size={BUTTON.cta} label={t('gz.download.iso.repo')} href={REPO} icon={<GitHubLogo />} />
        </HStack>
      </VStack>
    ),
    mirrors: <MirrorList sites={sites} />,
    verify: (
      <GuideProcedure
        label={t('gz.download.iso.verify.label')}
        steps={[
          step('verify.fetch'),
          step('verify.check', '$ sha256sum -c install-amd64-cjk-minimal-*.iso.sha256'),
          step('verify.manual', '$ sha256sum image.iso'),
        ]}
      />
    ),
    usb: (
      <VStack gap={SPACE.block}>
        <Banner
          status="warning"
          title={t('gz.download.iso.usb.warning.title')}
          description={t('gz.download.iso.usb.warning.desc')}
        />
        <GuideProcedure
          label={t('gz.download.iso.usb.label')}
          steps={[
            step('usb.verify'),
            step('usb.device', '$ lsblk'),
            step('usb.write', '$ sudo dd if=image.iso of=/dev/sdX bs=4M status=progress conv=fsync'),
          ]}
        />
      </VStack>
    ),
  };
  return <GuidePage {...page} slots={slots} />;
}

/** /official-media/: Gentoo's own media and the mirrors that carry them. */
export function OfficialMediaPage({mirrors, ...page}: Props) {
  const slots = {
    official: <OfficialList />,
    officialmirrors: <MirrorList sites={officialMediaMirrors(mirrors)} />,
  };
  return <GuidePage {...page} slots={slots} />;
}
