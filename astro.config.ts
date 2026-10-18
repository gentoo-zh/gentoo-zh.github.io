import stylex from '@stylexjs/unplugin/vite';
import {defineConfig, fontProviders} from 'astro/config';
import {scriptProvenance} from './scripts/lib/script-provenance.mjs';
import {stylexIslandRules} from './scripts/lib/stylex-island-rules.mjs';

// Pin Timestamp formatting to the UTC zone used by front-matter calendar dates.
process.env.TZ = 'UTC';

export default defineConfig({
  site: 'https://gentoozh.org',
  trailingSlash: 'always',
  build: {format: 'directory'},
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
          // Keep both navigation islands' dependencies together: automatic shared chunks lose
          // compression across the nav/contributors/search entries. SearchDialog stays lazy.
          codeSplitting: {
            groups: [
              {name: 'chrome', test: /\/src\/ui\/(chrome\/nav-client|section\/section-nav-client)\.tsx$/},
              // Search and contributor controls share these modules; one chunk avoids split overhead.
              {name: 'searchControls', test: /\/core\/dist\/(TextInput\/TextInput|Dialog\/Dialog(?:Header)?)\.js$/},
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
