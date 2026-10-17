import {readFileSync} from 'node:fs';
import type {APIRoute} from 'astro';
import {bundleFiles} from '../../../../content/posts';
import {LOCALES} from '../../../../i18n/locales';
import {localeParam} from '../../../../i18n/routes';

/** Images and other files in a post bundle, served next to the post as Hugo does. */
export function getStaticPaths() {
  return LOCALES.flatMap(locale =>
    bundleFiles(locale).map(({slug, file, path}) => ({params: {locale: localeParam(locale), slug, file}, props: {path}})),
  );
}

export const GET: APIRoute = ({props}) => new Response(readFileSync(props.path as string));
