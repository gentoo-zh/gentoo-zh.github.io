// Keep a usable destination link when meta refresh is disabled.
import {Button} from '@astryxdesign/core/Button';
import {Center} from '@astryxdesign/core/Center';
import {Icon} from '@astryxdesign/core/Icon';
import {VStack} from '@astryxdesign/core/Layout';
import {PageHeader} from './PageHeader';
import {CATALOGS, type Locale} from '../i18n/locales';
import {LAYOUT, SITE} from '../site';
import {ArrowRight} from './chrome/icons';
import {BUTTON, ICON, SPACE} from '../theme/scale';

export interface RedirectPageProps {
  locale: Locale;
  target: string;
}

export function RedirectPage({locale, target}: RedirectPageProps) {
  const m = CATALOGS[locale];
  return (
    <Center axis="both" height="100vh">
      <VStack gap={SPACE.group} hAlign="center" padding={SPACE.page}>
        <img src={SITE.logo} alt="" width={LAYOUT.logoSize * 2} height={LAYOUT.logoSize * 2} />
        <PageHeader title={m['gz.redirect.title']} description={m['gz.redirect.description']} align="center" />
        <Button variant="primary" size={BUTTON.cta} label={m['gz.redirect.go']} href={target} endContent={<Icon icon={ArrowRight} size={ICON.inline} />} />
      </VStack>
    </Center>
  );
}
