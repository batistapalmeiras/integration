// React
import { ReactNode } from 'react';
// Components
import { IconBadge } from '../../../components/MenuOptions';
// Local
import { ConsolidationKind } from '../../../domain/consolidation';
import { initialsOf } from '../../../domain/text';
import { ministryTile } from '../../CommunityGroups/ministryTile';
import { GroupCard, GroupHeader, GroupList, GroupTitle } from '../styles';

interface Row {
  id: string;
  groupName: string;
}

interface Props<T extends Row> {
  kind: ConsolidationKind;
  rows: T[];
  renderRow: (row: T) => ReactNode;
}

function tileOf(kind: ConsolidationKind, name: string): ReactNode {
  if (kind === 'small_group') return initialsOf(name, 2);
  return ministryTile(name);
}

export function GroupCards<T extends Row>({ kind, rows, renderRow }: Props<T>) {
  const groupNames = [...new Set(rows.map((row) => row.groupName))];

  return (
    <>
      {groupNames.map((name) => {
        const members = rows.filter((row) => row.groupName === name);
        return (
          <GroupCard key={name} aria-label={name}>
            <GroupHeader>
              <IconBadge>{tileOf(kind, name)}</IconBadge>
              <GroupTitle>{name}</GroupTitle>
            </GroupHeader>
            <GroupList>{members.map((row) => renderRow(row))}</GroupList>
          </GroupCard>
        );
      })}
    </>
  );
}
