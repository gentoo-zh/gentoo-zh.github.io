// Browser tests. `islands` exercises the island loaders on fixture pages and needs no build;
// `site` drives the built site in dist/ (run `pnpm build` first) through scripts/serve-dist.mjs, and
// `runtime` (check:runtime) measures each page type's sample there against the budgets.
import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  forbidOnly: Boolean(process.env.CI),
  reporter: 'list',
  use: {
    browserName: 'chromium',
    // A system Chrome saves the browser download locally; CI installs Playwright's Chromium.
    launchOptions: {executablePath: process.env.CHROME_PATH || undefined},
  },
  projects: [
    {name: 'islands', testDir: 'tests/islands'},
    {name: 'site', testDir: 'tests/site', testIgnore: 'runtime.spec.ts'},
    {name: 'runtime', testDir: 'tests/site', testMatch: 'runtime.spec.ts'},
  ],
});
