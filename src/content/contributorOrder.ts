import rawRoles from '../../data/contributor-roles.json' with {type: 'json'};
import {contributorRolesSchema} from '../data/schemas.ts';

const policy = contributorRolesSchema.parse(rawRoles);
export const CONTRIBUTOR_GROUPS = policy.groupOrder;
export type ContributorGroup = (typeof CONTRIBUTOR_GROUPS)[number];

// Policy order resolves contributors with more than one role.
export function contributorGroup(tags: readonly string[]): ContributorGroup {
  return policy.roles.find(role =>
    [...Object.values(role.labels), ...role.aliases.map(alias => alias.label)].some(name => tags.includes(name)),
  )?.group ?? policy.fallback.group;
}

interface Orderable {
  data: {title: string; tags: readonly string[]; weight?: number; contributions?: {repos: readonly unknown[]}};
}

/** Sort by weight, repository count and title; root collation preserves Hugo's Latin-before-Han order. */
export function groupContributors<T extends Orderable>(entries: readonly T[]): Array<{group: ContributorGroup; contributors: T[]}> {
  const collator = new Intl.Collator('und');
  const weight = (entry: T) => entry.data.weight ?? -Infinity;
  const repos = (entry: T) => entry.data.contributions?.repos.length ?? 0;
  const sorted = [...entries].sort(
    (a, b) => weight(a) - weight(b) || repos(b) - repos(a) || collator.compare(a.data.title, b.data.title),
  );
  return CONTRIBUTOR_GROUPS.map(group => ({
    group,
    contributors: sorted.filter(entry => contributorGroup(entry.data.tags) === group),
  })).filter(({contributors}) => contributors.length > 0);
}
