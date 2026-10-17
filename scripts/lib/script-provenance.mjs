import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {SCRIPT_OWNERS} from './ui-rules.mjs';

export const scriptDigest = code => createHash('sha256').update(code).digest('hex');

/** Record the bundler's source graph, rather than trusting a chunk's chosen name. */
export function scriptProvenance() {
  return {
    name: 'script-provenance',
    writeBundle(options, bundle) {
      const owners = new Map();
      const visit = (id, source) => {
        const known = owners.get(id) ?? new Set();
        if (known.has(source)) return;
        known.add(source);
        owners.set(id, known);
        const info = this.getModuleInfo(id);
        for (const dependency of [...(info?.importedIds ?? []), ...(info?.dynamicallyImportedIds ?? [])]) visit(dependency, source);
      };
      for (const {source} of SCRIPT_OWNERS) {
        const path = resolve(source);
        for (const id of this.getModuleIds()) {
          if (id === path || id.startsWith(`${path}?`)) visit(id, source);
        }
      }
      // Rolldown inserts its runtime after the module graph; inherit its actual chunk importers.
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        const sources = new Set(Object.keys(chunk.modules).flatMap(id => [...(owners.get(id) ?? [])]));
        for (const dependency of chunk.imports) {
          for (const id of Object.keys(bundle[dependency]?.modules ?? {})) {
            if (id === '\0rolldown/runtime.js') {
              owners.set(id, new Set([...(owners.get(id) ?? []), ...sources]));
            }
          }
        }
      }
      const chunks = {};
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        chunks[`/${chunk.fileName}`] = {
          digest: scriptDigest(chunk.code),
          modules: Object.keys(chunk.modules).map(id => ({id, owners: [...(owners.get(id) ?? [])]})),
        };
      }
      writeFileSync(resolve(options.dir, 'script-provenance.json'), JSON.stringify(chunks));
    },
  };
}
