// Components
import { TonePill } from '../../../components/StatusPill';
// Local
import { GroupName, GroupNameList } from '../styles';

export interface GroupWithRoles {
  id: string;
  name: string;
  roles: string[];
}

export function GroupNames({ groups }: { groups: GroupWithRoles[] }) {
  return (
    <GroupNameList>
      {groups.map((group) => (
        <GroupName key={group.id}>
          {group.name}
          {group.roles.map((role) => (
            <TonePill key={role} $tone="success">
              {role}
            </TonePill>
          ))}
        </GroupName>
      ))}
    </GroupNameList>
  );
}
