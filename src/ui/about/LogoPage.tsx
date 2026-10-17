// Group public/brand downloads under the Markdown headings in content/<locale>/logo.
import {Grid} from '@astryxdesign/core/Grid';
import {useMessage} from '../../i18n/useMessage';
import {SPACE, TEMPLATE} from '../../theme/scale';
import {SectionPage, type SectionPageProps} from '../section/SectionPage';
import {anchorId} from './anchors';
import {LogoDownloadTile} from './LogoDownloadTile';

type Variant = 'purpleTransparent' | 'purpleWhite' | 'purpleLavender' | 'blackTransparent' | 'blackWhite' | 'transparent' | 'white' | 'lavender' | 'old';
const FILE: Record<Variant, string> = {
  purpleTransparent: 'purple-transparent',
  purpleWhite: 'purple-white',
  purpleLavender: 'purple-lavender',
  blackTransparent: 'black-transparent',
  blackWhite: 'black-white',
  transparent: 'transparent',
  white: 'white',
  lavender: 'lavender',
  old: '',
};
const BACKGROUNDS = {
  purpleTransparent: 'transparent',
  purpleWhite: 'white',
  purpleLavender: 'lavender',
  blackTransparent: 'transparent',
  blackWhite: 'white',
  transparent: 'transparent',
  white: 'white',
  lavender: 'lavender',
  old: 'white',
} as const;
const FIVE: Variant[] = ['purpleTransparent', 'purpleWhite', 'purpleLavender', 'blackTransparent', 'blackWhite'];
const GROUPS: Record<string, Variant[]> = {
  horizontal: FIVE,
  vertical: FIVE,
  icon: ['transparent', 'white', 'lavender'],
  wordmark: ['purpleTransparent', 'blackTransparent'],
  previous: ['old'],
};

const fileName = (group: string, variant: Variant) => (variant === 'old' ? 'gentoo-zh-old.jpg' : `gentoo-zh-${group}-${FILE[variant]}.svg`);

export function LogoPage(page: Omit<SectionPageProps, 'slots' | 'children'> & {body: string}) {
  const t = useMessage();
  const slots = Object.fromEntries(
    Object.entries(GROUPS).map(([group, variants]) => [
      group,
      <Grid key={group} id={anchorId(page.locale, group)} columns={{minWidth: TEMPLATE.logoColumn}} gap={SPACE.page}>
        {variants.map(variant => {
          const file = fileName(group, variant);
          return (
            <LogoDownloadTile
              key={file}
              file={file}
              name={t(`gz.logo.variant.${variant}`)}
              downloadLabel={t('gz.logo.download')}
              background={BACKGROUNDS[variant]}
            />
          );
        })}
      </Grid>,
    ]),
  );
  return <SectionPage {...page} slots={slots} />;
}
