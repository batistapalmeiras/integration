// Libs
import { RawSelect } from 'bp-kit';
// Components
import { Panel, PanelHeader, PanelTitle } from '../../../components/Panel';
// Local
import { setViewRole, useViewRole } from '../../../features/access/viewRole';
import { toViewRole, VIEW_ROLES } from '../../../domain/access';
import { ROLE_LABELS } from '../../../types/enums';

export function ViewRolePanel() {
  const viewRole = useViewRole();

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Visão dos módulos</PanelTitle>
      </PanelHeader>
      <RawSelect
        label="Ver a Integração como"
        value={viewRole}
        onChange={(event) => setViewRole(toViewRole(event.target.value))}
      >
        {VIEW_ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </RawSelect>
    </Panel>
  );
}
