import {contributorCard, getContributorGroups, topContributors} from '../../content/contributors';
import {daysRunning} from '../../content/home';
import {getPosts, summarize} from '../../content/posts';
import type {Sponsor} from '../../data/schemas';
import {loadData} from '../../data/entries';
import overlayStats from '../../data/overlay-stats.json';
import type {Locale} from '../../i18n/locales';
import type {HomePageProps} from './HomePage';
import identicons from './home-identicons.json';

export async function homeData(locale: Locale): Promise<HomePageProps> {
  const posts = (await getPosts(locale)).slice(0, 3).map(summarize);
  const everyone = (await getContributorGroups(locale)).flatMap(group => group.contributors);
  const ranked = await topContributors(locale, everyone.length);
  // Ranked people first, then the profiles without a commit count; contributors still on their
  // default identicon stay off the wall.
  const people = [...new Map([...ranked.people, ...everyone.map(person => contributorCard(person, 'card'))].map(person => [person.slug, person])).values()];
  const defaults = new Set(identicons);
  const contributors = people.filter(person => !defaults.has(person.slug)).flatMap(({name, avatar, href}) =>
    avatar == null ? [] : [{name, avatar, href}]
  );
  const sponsors = (await loadData('sponsors') as {items: Sponsor[]}).items;
  return {locale, posts, contributors, contributorCount: everyone.length, commits: overlayStats.commits, days: daysRunning(), sponsors};
}
