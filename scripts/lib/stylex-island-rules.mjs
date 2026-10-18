import {readdirSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const SOURCE = /\.[cm]?[jt]sx?$/;

/**
 * Compile client-only StyleX modules in the server builds, which emit the only linked stylesheet.
 *
 * Astro builds the prerender (and SSR) environments before the client one, and @stylexjs/unplugin
 * appends its CSS to the first build's stylesheet. Modules reached only from `<script>` islands
 * (files-client, packages-client, ...) are compiled in the client build, after that stylesheet
 * has been hashed and linked, so their unique rules never shipped. This runs the StyleX plugin's
 * own transform on every source module before the server build bundles anything; the modules
 * themselves stay out of the server bundle. Packages are left alone: Astryx ships its classes
 * precompiled in astryx.css, and the server build externalizes node_modules.
 */
export function stylexIslandRules(root = 'src') {
  const sources = readdirSync(resolve(root), {recursive: true})
    .filter(path => SOURCE.test(path) && !path.endsWith('.d.ts'))
    .map(path => resolve(root, path));
  return {
    name: 'stylex-island-rules',
    apply: 'build',
    applyToEnvironment: environment => environment.config.consumer === 'server',
    async buildStart() {
      // Astro also runs a dev-mode server environment during builds; only bundling builds emit CSS.
      if (this.environment.mode !== 'build') return;
      const stylex = this.environment.config.plugins.find(plugin => plugin.name === '@stylexjs/unplugin');
      const transform = typeof stylex.transform === 'function' ? stylex.transform : stylex.transform.handler;
      // Each transform records the module's rules in the store the stylesheet is built from.
      await Promise.all(sources.map(id => transform.call(this, readFileSync(id, 'utf8'), id)));
    },
  };
}
