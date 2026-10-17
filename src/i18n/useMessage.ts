import {useTranslator} from '@astryxdesign/core/i18n';
import type {MessageKey} from './locales';

/** Typed access to the site catalog through Astryx's translator. */
export function useMessage(): (key: MessageKey, values?: Record<string, unknown>) => string {
  return useTranslator();
}
