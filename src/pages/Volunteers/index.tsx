// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, Skeleton, Typography, text, useAuthCtx, useModal } from 'bp-kit';
// Components
import { PageHeader } from '../../components/PageHeader';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { ADMIN_MANAGEABLE_ROLES, groupRolesByModule, UserRole } from '../../types/enums';
import { AddVolunteerModal } from './components/AddVolunteerModal';
import { useVolunteers } from './hooks/useVolunteers';
import { EmptySectionHint, ModuleSection, ModuleTitle, Section, Sections } from './styles';
import { VolunteerRow } from './types';

const ROLE_SECTION_LABELS: Record<UserRole, string> = {
  [UserRole.Pastor]: 'Pastores',
  [UserRole.Admin]: 'Administradores',
  [UserRole.Teacher]: 'Professores',
  [UserRole.IntegrationTeam]: 'Equipe de Integração',
};

const MODULE_GROUPS = groupRolesByModule([UserRole.Pastor, UserRole.Admin, UserRole.Teacher, UserRole.IntegrationTeam]);

export function VolunteersPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { volunteers, loading, error, addVolunteer } = useVolunteers();
  const { open, close, modal } = useModal('drawer');

  const isPastor = user?.role === UserRole.Pastor;
  const allowedRoles = isPastor ? Object.values(UserRole) : ADMIN_MANAGEABLE_ROLES;

  const openAddModal = () => open(<AddVolunteerModal close={close} onAdd={addVolunteer} allowedRoles={allowedRoles} />);

  const modules = MODULE_GROUPS.map((group) => ({
    ...group,
    sections: group.roles.map((role) => ({
      role,
      label: ROLE_SECTION_LABELS[role],
      volunteers: volunteers.filter((v) => v.role === role),
    })),
  }));

  const renderTable = (rows: VolunteerRow[]) => (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <Th>{text.fields.name}</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((volunteer) => (
            <Tr key={volunteer.id} $clickable onClick={() => navigate(`${AppRoute.Volunteers}/${volunteer.id}`)}>
              <Td data-label={text.fields.name}>
                {volunteer.name}
                {!volunteer.active && ' (desabilitado)'}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );

  return (
    <div>
      <PageHeader
        title="Voluntários"
        back
        action={<Button onClick={openAddModal}>Adicionar</Button>}
      />

      {loading && <Skeleton $h="240px" />}
      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && volunteers.length === 0 && (
        <Empty title="Nenhum voluntário cadastrado" description="Adicione o primeiro pelo botão acima." />
      )}

      {!loading && !error && volunteers.length > 0 && (
        <Sections>
          {modules.map((group) => (
            <ModuleSection key={group.module} aria-labelledby={`module-${group.module}`}>
              <ModuleTitle id={`module-${group.module}`}>{group.label}</ModuleTitle>
              {group.sections.map((section) => (
                <Section key={section.role}>
                  <Typography type="label">{section.label}</Typography>
                  {section.volunteers.length > 0 ? (
                    renderTable(section.volunteers)
                  ) : (
                    <EmptySectionHint>Nenhum voluntário cadastrado.</EmptySectionHint>
                  )}
                </Section>
              ))}
            </ModuleSection>
          ))}
        </Sections>
      )}

      {modal}
    </div>
  );
}
