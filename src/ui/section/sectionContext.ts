// SectionLayout provides sidebar selection and the optional Markdown source URL to SectionPage.
import {createContext, useContext} from 'react';
import type {SectionPageId} from '../chrome/sections';

export interface SectionPageContextValue {
  current: SectionPageId | 'landing';
  editHref: string | null;
}

export const SectionPageContext = createContext<SectionPageContextValue | null>(null);

export function useSectionPageContext(): SectionPageContextValue | null {
  return useContext(SectionPageContext);
}
