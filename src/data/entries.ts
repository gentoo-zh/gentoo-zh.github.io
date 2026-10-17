import {getEntry} from 'astro:content';

type DataCollection = 'costs' | 'mirrors' | 'channels' | 'sponsors';

/** Validated contents of one data file; each data collection holds a single entry named after itself. */
export async function loadData<C extends DataCollection>(collection: C) {
  const entry = await getEntry(collection, collection);
  if (entry == null) throw new Error(`data collection "${collection}" is empty`);
  return entry.data;
}
