import {basename} from 'node:path';
import stylex from '@stylexjs/unplugin/vite';
import {defineConfig, fontProviders} from 'astro/config';
import {scriptProvenance} from './scripts/lib/script-provenance.mjs';
import {stylexIslandRules} from './scripts/lib/stylex-island-rules.mjs';

// Pin Timestamp formatting to the UTC zone used by front-matter calendar dates.
process.env.TZ = 'UTC';

export default defineConfig({
  site: 'https://gentoozh.org',
  trailingSlash: 'always',
  // Inline the stylesheet: no render-blocking request, so first paint is 250-350 ms earlier (throttled lab).
  // Costs 31-41 KB br per HTML page and loses the cross-page CSS cache; kept because Cloudflare RUM
  // (2026-10-04..18, bots excluded) shows 1.31 page loads per visit, so most visits are the first-visit case.
  build: {format: 'directory', inlineStylesheets: 'always'},
  // Figtree from @fontsource/figtree; Base.astro preloads it. `optional` keeps the fallback for a view
  // whose font missed the first paint instead of swapping mid-read, which reflowed every text block.
  // No generated fallback: the locale stacks after `--font-figtree` (SiteShell, theme) name the CJK fonts.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Figtree',
      cssVariable: '--font-figtree',
      display: 'optional',
      fallbacks: [],
      optimizedFallbacks: false,
      options: {
        variants: [
          {weight: 400, style: 'normal', src: ['@fontsource/figtree/files/figtree-latin-400-normal.woff2']},
          {weight: 600, style: 'normal', src: ['@fontsource/figtree/files/figtree-latin-600-normal.woff2']},
        ],
      },
    },
  ],
  vite: {
    build: {
      rolldownOptions: {
        output: {
          // Three tiers. Startup modules, which an island's boot script imports statically, load before the
          // `load` event and stay small; React and the navigation code are one idle chunk each; every other
          // island's code follows the import graph and arrives when the scheduler starts that island.
          // Measured 2026-10-18, brotli, before `load` / whole closure with idle imports (/faq/, /, /packages/):
          //   without the startup and chrome groups: 4.7 / 169.5 KB, 4.3 / 164.6 KB, 5.5 / 252.4 KB
          //   with them:                             4.3 / 148.9 KB, 4.0 / 147.4 KB, 4.9 / 235.1 KB
          // The automatic split cost /faq/ 20.6 KB: brotli lost 16.6 KB across its 25 idle chunks (their sum
          // is 169.5 KB, their concatenation 148.0 KB) and the import/export glue between them added 4.9 KB.
          codeSplitting: {
            groups: [
              {name: 'preload-helper', test: /preload-helper/, priority: 3},
              // Shared startup modules keep their own chunks, claimed before `chrome` takes its dependencies
              // recursively: otherwise kinds.ts and sectionNavMarks.ts land in `chrome` and every boot script
              // imports the 140 KB chunk statically. A module with one importer stays inlined in it.
              {
                name: (id, ctx) => ((ctx.getModuleInfo(id)?.importers.length ?? 0) > 1 ? basename(id).replace(/\.\w+$/, '') : null),
                tags: ['$initial'],
                test: id => !id.includes('?astro&type=script'),
                priority: 2,
              },
              // Every island uses React and it changes least, so one chunk stays cached across deploys.
              {name: 'react', test: /\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:react|react-dom|scheduler)\//, priority: 1},
              // The top navigation and the sidebar, with the Astryx code they share, as one idle chunk: /faq/
              // makes 4 idle requests instead of 25. A separate sidebar chunk saves home 1.9 KB and costs
              // section pages 1.4 KB.
              {name: 'chrome', test: /\/src\/ui\/(chrome\/nav-client|section\/section-nav-client)\.tsx$/},
              // A searchControls group (TextInput, Dialog) is left out: beside `chrome` it saves 0.1-0.2 KB on
              // /contributors/ and /packages/, costs 1.7 KB on /status/ and the guides, and changes no request count.
            ],
          },
        },
      },
    },
    plugins: [
      scriptProvenance(),
      stylexIslandRules(),
      // Prefix StyleX classes separately from Astryx and emit rules after its theme layer.
      stylex({
        dev: false,
        runtimeInjection: false,
        enableInlinedConditionalMerge: true,
        treeshakeCompensation: true,
        classNamePrefix: 'p',
        unstable_moduleResolution: {type: 'commonJS'},
        useCSSLayers: {before: ['reset', 'astryx-base', 'astryx-theme']},
      }),
    ],
  },
});
