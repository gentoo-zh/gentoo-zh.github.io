import {readFileSync} from 'node:fs';
import {parseFrontmatter} from 'astro/markdown';

// Reuse Astro's YAML parser; wrap root lists because collection entries must be objects.
// Quote calendar dates so invalid days reach the schema instead of rolling over as Date values.
const keepDates = (source: string) => source.replace(/^([ \t]*(?:- +)?[^\s#'"][^:#\n]*: +|[ \t]*- +)(\d{4}-\d{2}-\d{2})(?=[ \t]*(?:#.*)?$)/gm, "$1'$2'");

export function readYaml(path: string): Record<string, unknown> {
  const source = readFileSync(path, 'utf8');
  if (/^(?:---|\+\+\+)/m.test(source)) throw new Error(`${path}: one YAML document per file; no line may start with --- or +++`);
  let root: unknown;
  try {
    root = parseFrontmatter(`---\n${keepDates(source)}\n---\n`).frontmatter;
  } catch (error) {
    throw new Error(`${path}: ${error instanceof Error ? error.message : String(error)}`, {cause: error});
  }
  return Array.isArray(root) ? {items: root} : (root as Record<string, unknown>);
}
