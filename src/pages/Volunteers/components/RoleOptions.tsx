// Components
import { groupRolesByModule, ROLE_LABELS, UserRole } from '../../../types/enums';

interface Props {
  roles: UserRole[];
}

export function RoleOptions({ roles }: Props) {
  return (
    <>
      {groupRolesByModule(roles).map((group) => (
        <optgroup key={group.module} label={group.label}>
          {group.roles.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}
