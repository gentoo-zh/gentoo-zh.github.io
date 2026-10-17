import type {ReactNode} from 'react';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {LANGUAGE_TAG, providerMessages, type Locale} from '../i18n/locales';

// Astryx Theme would override the reader's data-theme choice with its own color-scheme.
export function SiteI18n({locale, children}: {locale: Locale; children: ReactNode}) {
  return (
    <InternationalizationProvider locale={LANGUAGE_TAG[locale]} messages={providerMessages(locale)}>
      {children}
    </InternationalizationProvider>
  );
}
