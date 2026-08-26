// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Skeleton, Typography, text, useAuthCtx, useModal } from 'bp-kit';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { ADMIN_MANAGEABLE_ROLES, UserRole } from '../../types/enums';
import { AddVolunteerModal } from './components/AddVolunteerModal';
import { useVolunteers } from './hooks/useVolunteers';
import { EmptySectionHint, Section, Sections } from './styles';
import { VolunteerRow } from './types';

const SECTIONS: { role: UserRole; label: string }[] = [
  { role: UserRole.Pastor, label: 'Pastores' },
  { role: UserRole.Admin, label: 'Administradores' },
  { role: UserRole.Teacher, label: 'Professores' },
  { role: UserRole.IntegrationTeam, label: 'Equipe de Integração' },
];

export function VolunteersPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { volunteers, loading, error, addVolunteer } = useVolunteers();
  const { open, close, modal } = useModal('drawer');

  const isPastor = user?.role === UserRole.Pastor;
  const allowedRoles = isPastor ? Object.values(UserRole) : ADMIN_MANAGEABLE_ROLES;

  const openAddModal = () => open(<AddVolunteerModal close={close} onAdd={addVolunteer} allowedRoles={allowedRoles} />);

  const sections = SECTIONS.map((section) => ({
    ...section,
    volunteers: volunteers.filter((v) => v.role === section.role),
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
        subtitle="Contas com acesso ao sistema"
        back
        action={<Button onClick={openAddModal}>Adicionar voluntário</Button>}
      />

      {loading && <Skeleton $h="240px" />}
      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && volunteers.length === 0 && (
        <Empty title="Nenhum voluntário cadastrado" description="Adicione o primeiro pelo botão acima." />
      )}

      {!loading && !error && sections.length > 0 && (
        <Sections>
          {sections.map((section) => (
            <Section key={section.role}>
              <Typography type="label">{section.label}</Typography>
              {section.volunteers.length > 0 ? (
                renderTable(section.volunteers)
              ) : (
                <EmptySectionHint>Nenhum voluntário cadastrado.</EmptySectionHint>
              )}
            </Section>
          ))}
        </Sections>
      )}

      {modal}
    </div>
  );
}
