import {readFileSync} from 'node:fs';
import type {APIRoute} from 'astro';
import {contributorFiles} from '../../../../content/contributors';
import {LOCALES} from '../../../../i18n/locales';
import {localeParam} from '../../../../i18n/routes';

/** Avatars in a contributor bundle, served next to the page as Hugo does. */
export function getStaticPaths() {
  return LOCALES.flatMap(locale =>
    contributorFiles(locale).map(({slug, file, path}) => ({params: {locale: localeParam(locale), slug, file}, props: {path}})),
  );
}

export const GET: APIRoute = ({props}) => new Response(readFileSync(props.path as string));
