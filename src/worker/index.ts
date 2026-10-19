// The Worker in front of the static assets; wrangler.jsonc routes page paths through it.
import {handle, type Assets} from './language.ts';

type Env = {ASSETS: Assets};

export default {
  fetch: (request: Request, env: Env): Promise<Response> => handle(request, env.ASSETS),
};
