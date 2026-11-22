// Libs
import { RawSelect } from 'bp-kit';
import styled from 'styled-components';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { setViewRole, useViewRole } from '../../../features/access/viewRole';
import { toViewRole, VIEW_ROLES } from '../../../domain/access';
import { ROLE_LABELS } from '../../../types/enums';

const Form = styled.div`
  max-width: 560px;
`;

export function ViewRoleForm() {
  const viewRole = useViewRole();

  return (
    <Form>
      <PageHeader title="Visão dos módulos" />
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
    </Form>
  );
}
