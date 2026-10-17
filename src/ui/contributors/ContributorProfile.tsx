// Copyright (c) Meta Platforms, Inc. and affiliates.
// Omit the template's side panel because it would duplicate the profile facts.

import * as stylex from '@stylexjs/stylex';
import {Layout, LayoutHeader, LayoutContent, VStack, HStack, StackItem} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {ContributorAvatar} from './ContributorAvatar';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Table, proportional, type TableColumn} from '@astryxdesign/core/Table';
import type {ContributorGroup} from '../../content/contributorOrder';
import type {ContributorCard} from './ContributorsLibrary';
import type {Locale} from '../../i18n/locales';
import {PostMarkdown} from '../../markdown/PostMarkdown';
import {useMessage} from '../../i18n/useMessage';
import {GitHubLogo} from '../chrome/icons';
import {SITE} from '../../site';
import {media} from '../../theme/layout.stylex';
import {SPACE, BUTTON, ICON, TEMPLATE} from '../../theme/scale';
import {PageHeader} from '../PageHeader';

const styles = stylex.create({
  header: {
    flexDirection: {default: 'row', [media.mobile]: 'column'},
    alignItems: {default: 'center', [media.mobile]: 'flex-start'},
  },
  identity: {minWidth: 0, width: {default: 'auto', [media.mobile]: '100%'}},
  repository: {overflowWrap: 'anywhere'},
});

export interface ContributorProfileProps {
  person: ContributorCard;
  locale: Locale;
  group: ContributorGroup;
  roles: string[];
  /** GitHub profile; absent when the account no longer exists. */
  profile?: string;
  description: string;
  feature?: string;
  body?: string;
}

/** The person's commits in `repo`; without a GitHub handle there is no author to filter by, so no link. */
function commitsHref(person: ContributorCard, repo: string) {
  return person.handle == null ? undefined : `${SITE.github}/${repo}/commits?author=${encodeURIComponent(person.handle)}`;
}

function ProfileHeader({person, locale, profile, description, feature, body}: ContributorProfileProps) {
  const t = useMessage();
  const summary = description.startsWith(`${person.name} — `) ? description.slice(person.name.length + 3) : description;
  const number = new Intl.NumberFormat(locale);
  return (
    <LayoutHeader hasDivider padding={SPACE.page}>
      <VStack gap={SPACE.block}>
        <Link href={person.href.replace(/[^/]+\/$/, '')} color="secondary">
          <HStack gap={SPACE.hairline} vAlign="center">
            <Icon icon="chevronLeft" size={ICON.inline} color="inherit" />
            {t('gz.contributors.all')}
          </HStack>
        </Link>
        <HStack gap={SPACE.page} vAlign="center" xstyle={styles.header}>
          <ContributorAvatar src={feature ?? person.avatar} name={person.name} profile />
          <StackItem size={TEMPLATE.fill} xstyle={styles.identity}>
            <VStack gap={SPACE.block}>
              <PageHeader title={person.name} description={body != null
                ? <PostMarkdown locale={locale} pages={new Set()}>{body}</PostMarkdown>
                : summary || undefined} />
              <MetadataList columns="multi" orientation="horizontal">
                {person.handle != null && <MetadataListItem label={t('gz.contributors.handle')}>@{person.handle}</MetadataListItem>}
                {person.commits != null && person.repos.length !== 1 && <MetadataListItem label={t('gz.contributors.commitsColumn')}>{number.format(person.commits)}</MetadataListItem>}
              </MetadataList>
              <HStack gap={SPACE.tight} wrap="wrap">
                {profile != null && <Button label={t('gz.contributors.github')} href={profile} variant="primary" size={BUTTON.cta} icon={<GitHubLogo />} />}
                {person.repos.length > 0 && <Button label={t('gz.contributors.viewCommits')} href="#repositories" variant="secondary" size={BUTTON.cta} icon={<Icon icon="clock" size={ICON.inline} />} />}
              </HStack>
            </VStack>
          </StackItem>
        </HStack>
      </VStack>
    </LayoutHeader>
  );
}

function RepositoryMetadata({person, locale}: {person: ContributorCard; locale: Locale}) {
  const t = useMessage();
  const number = new Intl.NumberFormat(locale);
  const columns: TableColumn<ContributorCard['repos'][number]>[] = [
    {
      key: 'repo',
      header: t('gz.contributors.repoColumn'),
      width: proportional(2),
      renderCell: ({repo}) => {
        const href = commitsHref(person, repo);
        return href == null ? <Text type="inherit" xstyle={styles.repository}>{repo}</Text> : <Link href={href} xstyle={styles.repository}>{repo}</Link>;
      },
    },
    {
      key: 'commits',
      header: t('gz.contributors.commitsColumn'),
      align: 'end',
      renderCell: ({commits}) => t('gz.contributors.commits', {count: commits}),
    },
  ];
  return (
    <VStack gap={SPACE.block}>
      <Heading level={2} id="repositories">{t('gz.contributors.repos')} ({number.format(person.repos.length)})</Heading>
      <Table aria-label={t('gz.contributors.repos')} data={person.repos} columns={columns} idKey="repo" hasHover />
    </VStack>
  );
}

export function ContributorProfile(props: ContributorProfileProps) {
  const {person, locale} = props;
  return (
    <Layout
      height="auto"
      data-pagefind-body
      defaultHasDividers
      header={<ProfileHeader {...props} />}
      content={
        <LayoutContent padding={SPACE.page}>
          {(person.repos.length > 0 || person.commits != null) && <RepositoryMetadata person={person} locale={locale} />}
        </LayoutContent>
      }
    />
  );
}
