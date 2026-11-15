// React
import { useState } from 'react';
// Components
import { TonePill } from '../../../components/StatusPill';
// Local
import { GroupName, GroupNameList, MoreGroups } from '../styles';

const VISIBLE_GROUPS = 3;

export interface GroupWithRoles {
  id: string;
  name: string;
  roles: string[];
}

export function GroupNames({ groups }: { groups: GroupWithRoles[] }) {
  const [expanded, setExpanded] = useState(false);
  const hidden = expanded ? 0 : Math.max(0, groups.length - VISIBLE_GROUPS);
  const shown = hidden > 0 ? groups.slice(0, VISIBLE_GROUPS) : groups;

  return (
    <GroupNameList>
      {shown.map((group) => (
        <GroupName key={group.id}>
          {group.name}
          {group.roles.map((role) => (
            <TonePill key={role} $tone="success">
              {role}
            </TonePill>
          ))}
        </GroupName>
      ))}
      {hidden > 0 && (
        <MoreGroups type="button" onClick={() => setExpanded(true)}>
          … mais {hidden}
        </MoreGroups>
      )}
    </GroupNameList>
  );
}
