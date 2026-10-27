import {contributorCard, getContributorGroups, topContributors} from '../../content/contributors';
import {daysRunning} from '../../content/home';
import {getPosts, summarize} from '../../content/posts';
import type {Sponsor} from '../../data/schemas';
import {loadData} from '../../data/entries';
import overlayStats from '../../data/overlay-stats.json';
import type {Locale} from '../../i18n/locales';
import type {HomePageProps} from './HomePage';
import identicons from './home-identicons.json';
import homeImages from './home-images.json';
import {homeImageOrder} from './homeImages';

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
  // The wall mosaic and the AvatarGroup images are committed; a contributor change needs them rebuilt.
  const images = (homeImages.locales as Record<Locale, HomePageProps['images']>)[locale];
  if (images?.order !== homeImageOrder(contributors.map(person => person.avatar))) {
    throw new Error(`src/ui/home/home-images.json does not match the ${locale} contributor order; run pnpm gen:home-images`);
  }
  const sponsors = (await loadData('sponsors') as {items: Sponsor[]}).items.filter(sponsor => !sponsor.individual);
  return {locale, posts, contributors, contributorCount: everyone.length, commits: overlayStats.commits, days: daysRunning(), sponsors, images};
}
