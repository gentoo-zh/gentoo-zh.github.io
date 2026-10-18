// Serves the built site (dist/) once per worker on a free port; requests to other origins are aborted,
// so a test never depends on the live status API, GitHub or the distfiles listing.
import {existsSync} from 'node:fs';
import {test as base} from '@playwright/test';
import {serveDist} from '../../scripts/serve-dist.mjs';

export {expect} from '@playwright/test';

export const test = base.extend<object, {siteURL: string}>({
  siteURL: [
    async ({}, use) => {
      if (!existsSync('dist/index.html')) throw new Error('dist/ is missing; run `pnpm build` before `pnpm test:site`.');
      const server = await serveDist({root: 'dist'});
      await use(server.url);
      await server.close();
    },
    {scope: 'worker'},
  ],
  baseURL: async ({siteURL}, use) => use(siteURL),
  context: async ({context, siteURL}, use) => {
    await context.route(url => url.origin !== siteURL, route => route.abort());
    await use(context);
  },
});
