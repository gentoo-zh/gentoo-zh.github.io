import {List, ListItem} from '@astryxdesign/core/List';
import {Text} from '@astryxdesign/core/Text';
import {SectionPage, type SectionPageProps} from '../section/SectionPage';

type Props = Omit<SectionPageProps, 'body' | 'children'> & {body: string};

export function ChangelogPage({body, ...page}: Props) {
  const parts = body.split(/^## (\S+) (.+?) \{#([a-z0-9-]+)\}$/m);
  const entries = [];
  for (let index = 1; index < parts.length; index += 4) entries.push({date: parts[index], title: parts[index + 1], id: parts[index + 2], text: parts[index + 3].trim()});
  if (entries.length === 0) throw new Error(`${page.title}: no "## <date> <title> {#id}" entries`);
  const list = (
    <List density="compact" hasDividers edgeCompensation="inline">
      {entries.map(entry => (
        <ListItem
          key={entry.id}
          {...{id: entry.id}}
          label={entry.title}
          endContent={
            <Text color="secondary" textWrap="nowrap">
              {entry.date}
            </Text>
          }
          description={
            <Text type="supporting" color="secondary">
              {entry.text}
            </Text>
          }
        />
      ))}
    </List>
  );
  return (
    <SectionPage
      {...page}
      body={`${parts[0]}\n\n<!-- slot:entries -->\n`}
      slots={{entries: {node: list, outline: entries.map(entry => ({id: entry.id, label: `${entry.date} ${entry.title}`, level: 2}))}}}
    />
  );
}
