import stylex from '@stylexjs/unplugin/vite';
import {defineConfig} from 'astro/config';
import {scriptProvenance} from './scripts/lib/script-provenance.mjs';

// Pin Timestamp formatting to the UTC zone used by front-matter calendar dates.
process.env.TZ = 'UTC';

export default defineConfig({
  site: 'https://gentoozh.org',
  trailingSlash: 'always',
  build: {format: 'directory'},
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
