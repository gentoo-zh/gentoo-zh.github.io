import {fileURLToPath} from 'node:url';
import type {Loader, LoaderContext} from 'astro/loaders';
import {readYaml} from './yaml.ts';

/** Initial YAML/schema errors stop the build; dev reload errors retain the last valid entry. */
export function yamlFile(path: string): Loader {
  async function sync({collection, store, parseData, generateDigest}: LoaderContext) {
    const raw = readYaml(path);
    const data = await parseData({id: collection, data: raw, filePath: path});
    store.clear();
    store.set({id: collection, data, filePath: path, digest: generateDigest(raw)});
  }
  return {
    name: 'yaml-file',
    async load(context) {
      await sync(context);
      const absolute = fileURLToPath(new URL(path, context.config.root));
      context.watcher?.add(absolute);
      context.watcher?.on('change', changed => {
        if (changed === absolute) sync(context).catch(error => context.logger.error(String(error)));
      });
    },
  };
}
