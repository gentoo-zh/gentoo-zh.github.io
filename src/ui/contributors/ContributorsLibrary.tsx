// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useState, useMemo, useRef} from 'react';
import {flushSync} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import {media} from '../../theme/layout.stylex';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {ToggleButton, ToggleButtonGroup} from '@astryxdesign/core/ToggleButton';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Section} from '@astryxdesign/core/Section';
import {Grid} from '@astryxdesign/core/Grid';
import {HStack, VStack, StackItem} from '@astryxdesign/core/Stack';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {OverflowList} from '@astryxdesign/core/OverflowList';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {ContributorAvatar} from './ContributorAvatar';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Link} from '@astryxdesign/core/Link';
import type {ContributorGroup} from '../../content/contributorOrder';
import type {contributorCard} from '../../content/contributors';
import {useMessage} from '../../i18n/useMessage';
import {ROLE_ATTRIBUTE, ROLE_EVENT} from './roles';
import {SPACE, BUTTON, ICON, TEMPLATE} from '../../theme/scale';

export type ContributorCard = ReturnType<typeof contributorCard>;
export interface ContributorsLibraryProps {
  groups: Array<{group: ContributorGroup; people: ContributorCard[]}>;
}

// Two columns on phones; one card per row there left a single avatar filling half a screen.
const styles = stylex.create({
  // Grid sets its tracks through this variable; a null default would drop them on desktop.
  grid: {gridTemplateColumns: {default: 'var(--x-gridTemplateColumns)', [media.mobile]: 'repeat(2, minmax(0, 1fr))'}},
});

type LibraryItem = ContributorCard & {category: ContributorGroup};

function LibraryCard({item}: {item: LibraryItem}) {
  const t = useMessage();
  const topRepo = [...item.repos].sort((a, b) => b.commits - a.commits)[0]?.repo;
  const description = [t(`gz.contributors.group.${item.category}`), topRepo].filter(Boolean).join(' · ');
  return (
    <Card padding={TEMPLATE.zero}>
      <AspectRatio ratio={TEMPLATE.libraryImageRatio} fit="center">
        <ContributorAvatar src={item.avatar} name={item.name} />
      </AspectRatio>
      <Section variant="transparent" padding={SPACE.block}>
        <VStack gap={SPACE.hairline}>
          <Heading level={3} maxLines={1}><Link href={item.href} type="inherit" color="inherit">{item.name}</Link></Heading>
          {item.handle != null && <Text type="supporting" color="secondary">@{item.handle}</Text>}
          <Text type="body" size={BUTTON.inline} color="secondary" maxLines={1}>
            {description}
          </Text>
          {item.commits != null && <Text type="supporting" color="secondary" maxLines={1}>
            {t('gz.contributors.commits', {count: item.commits})}
          </Text>}
        </VStack>
      </Section>
    </Card>
  );
}

function LibrarySection({
  category,
  items,
}: {
  category: ContributorGroup;
  items: LibraryItem[];
}) {
  const t = useMessage();
  return (
    <VStack gap={SPACE.page}>
      <Heading level={2} id={`group-${category}`}>{t(`gz.contributors.group.${category}`)}</Heading>
      <Grid columns={{minWidth: TEMPLATE.libraryColumn}} gap={SPACE.block} xstyle={styles.grid}>
        {items.map(item => (
          <LibraryCard key={item.slug} item={item} />
        ))}
      </Grid>
    </VStack>
  );
}

export function ContributorsLibrary({groups}: ContributorsLibraryProps) {
  const t = useMessage();
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const [repo, setRepo] = useState('');
  const [sortOrder, setSortOrder] = useState<'name' | 'commits'>('commits');
  const categories = [{value: '', label: t('gz.contributors.filterAll')}, ...groups.map(({group}) => ({value: group, label: t(`gz.contributors.group.${group}`)}))];
  const repos = [...new Set(groups.flatMap(({people}) => people.flatMap(person => person.repos.map(({repo}) => repo))))].sort();
  const groupedSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    return groups.filter(({group}) => activeTab === '' || activeTab === group).map(({group, people}) => ({
      category: group,
      items: people.filter(person =>
        (repo === '' || person.repos.some(entry => entry.repo === repo)) &&
        `${person.name} ${person.handle ?? ''} ${person.slug}`.toLowerCase().includes(query),
      ).sort((a, b) => (sortOrder === 'commits' ? (b.commits ?? 0) - (a.commits ?? 0) : 0) || a.name.localeCompare(b.name, 'en')).map(person => ({...person, category: group})),
    })).filter(({items}) => items.length > 0);
  }, [groups, activeTab, search, repo, sortOrder]);
  // A press held before mounting whose toggle the overflow list folded away; it toggles as the group does,
  // and commits at once so a press repeated after it sees the result.
  useEffect(() => {
    const press = (event: Event) => {
      const role = (event as CustomEvent<string>).detail;
      flushSync(() => setActiveTab(active => (active === role ? '' : role)));
    };
    document.addEventListener(ROLE_EVENT, press);
    return () => document.removeEventListener(ROLE_EVENT, press);
  }, []);

  return (
    <VStack gap={SPACE.page}>
      <VStack gap={SPACE.block}>
        <TextInput
          ref={searchInput}
          label={t('gz.contributors.search')}
          isLabelHidden
          placeholder={t('gz.contributors.searchPlaceholder')}
          value={search}
          onChange={setSearch}
          startIcon={<Icon icon="search" size={ICON.inline} />}
          size={BUTTON.cta}
        />
        <HStack vAlign="center" gap={SPACE.block}>
          <StackItem size={TEMPLATE.fill}>
            <VStack>
              <ToggleButtonGroup
                label={t('gz.contributors.filterGroup')}
                value={activeTab}
                onChange={v => setActiveTab(v ?? '')}>
                <OverflowList
                  gap={SPACE.hairline}
                  behavior="observeParent"
                  overflowRenderer={overflowItems => (
                    <DropdownMenu
                      button={{
                        label: t('gz.contributors.moreRoles', {count: overflowItems.length}),
                        variant: 'ghost',
                        size: BUTTON.cta,
                      }}
                      items={overflowItems.map(({index}) => ({
                        label: categories[index].label,
                        onClick: () => setActiveTab(categories[index].value),
                      }))}
                    />
                  )}>
                  {categories.map(cat => (
                    <ToggleButton
                      key={cat.value}
                      label={cat.label}
                      value={cat.value}
                      size={BUTTON.cta}
                      {...{[ROLE_ATTRIBUTE]: cat.value}}
                    />
                  ))}
                </OverflowList>
              </ToggleButtonGroup>
            </VStack>
          </StackItem>
          {/* Static items keep their width: before OverflowList measures, every role toggle is on the
              line, and shrinking these buttons then let them widen and jump once the toggles folded. */}
          <StackItem>
            <DropdownMenu
              hasChevron={false}
              button={{
                label: t('gz.contributors.filterRepo'),
                tooltip: repo || t('gz.contributors.filterAllRepos'),
                icon: <Icon icon="funnel" size={ICON.inline} />,
                isIconOnly: true,
                size: BUTTON.cta,
              }}
              items={[
                {label: t('gz.contributors.filterAllRepos'), onClick: () => setRepo('')},
                ...repos.map(value => ({label: value, onClick: () => setRepo(value)})),
              ]}
            />
          </StackItem>
          <StackItem>
            <DropdownMenu
              button={{label: t(`gz.contributors.sort.${sortOrder}`), 'aria-label': t('gz.contributors.sort'), size: BUTTON.cta}}
              items={[
                {label: t('gz.contributors.sort.commits'), onClick: () => setSortOrder('commits')},
                {label: t('gz.contributors.sort.name'), onClick: () => setSortOrder('name')},
              ]}
            />
          </StackItem>
        </HStack>
      </VStack>

      {groupedSections.length === 0 ? (
        <EmptyState
          title={t('gz.contributors.emptyTitle')}
          icon={<Icon icon="search" />}
          actions={<Button label={t('gz.contributors.clearFilters')} variant="primary" size={BUTTON.cta} icon={<Icon icon="close" size={ICON.inline} />} onClick={() => {
            setSearch('');
            setRepo('');
            setActiveTab('');
            searchInput.current?.focus();
          }} />}
        />
      ) : (
        <VStack gap={SPACE.page}>
          {groupedSections.flatMap(section => [
            <Divider key={`d-${section.category}`} />,
            <LibrarySection
              key={section.category}
              category={section.category}
              items={section.items}
            />,
          ])}
        </VStack>
      )}
    </VStack>
  );
}
