// React
import { useNavigate } from 'react-router-dom';
// Libs
import {
  Button,
  Empty,
  ModalActions,
  ModalTitle,
  Skeleton,
  text,
  Typography,
  useAuthCtx,
  useModal,
  useToast,
} from 'bp-kit';
// Components
import { PageHeader } from '../../components/PageHeader';
// Local
import { Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { AppRoute } from '../../routes/paths';
import { assignableRoles, canChangeRole } from '../../domain/volunteers';
import { groupRolesByModule, ROLE_LABELS, UserRole } from '../../types/enums';
import { VolunteerRow } from '../../repositories/volunteers';
import { AddVolunteerModal } from './components/AddVolunteerModal';
import { DraggableVolunteer, RoleBoard, RoleDropZone } from './components/RoleBoard';
import { useVolunteers } from './hooks/useVolunteers';
import { EmptySectionHint, ModuleSection, ModuleTitle, Sections } from './styles';

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
  const { volunteers, loading, error, addVolunteer, changeRole } = useVolunteers();
  const { open, close, modal } = useModal('drawer');
  const { show: showToast, toast } = useToast();

  const allowedRoles = assignableRoles(user?.role);
  const actor = { id: user?.id ?? '', role: user?.role ?? '' };
  const canMove = (volunteer: VolunteerRow, target: UserRole) => canChangeRole(actor, volunteer, target);
  const canDrag = (volunteer: VolunteerRow) => allowedRoles.some((role) => canMove(volunteer, role));

  const confirmMove = (volunteer: VolunteerRow, target: UserRole) =>
    open(
      <>
        <ModalTitle onClose={close}>
          Mover {volunteer.name} para {ROLE_SECTION_LABELS[target]}?
        </ModalTitle>
        <Typography type="p">
          {volunteer.name} deixa de ser {ROLE_LABELS[volunteer.role]} e passa a ter as permissões de{' '}
          {ROLE_LABELS[target]}.
        </Typography>
        <ModalActions>
          <Button
            type="button"
            variant="primary"
            onClick={async () => {
              try {
                await changeRole(volunteer.id, target);
                close();
              } catch (e) {
                close();
                showToast(e instanceof Error ? e.message : 'Não foi possível mudar a permissão.');
              }
            }}
          >
            Mover
          </Button>
        </ModalActions>
      </>,
    );

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
            <DraggableVolunteer key={volunteer.id} volunteer={volunteer} enabled={canDrag(volunteer)}>
              {({ ref, dragProps, isDragging }) => (
                <Tr
                  ref={ref}
                  {...dragProps}
                  $clickable
                  style={{ opacity: isDragging ? 0.4 : 1, touchAction: canDrag(volunteer) ? 'pan-y' : undefined }}
                  onClick={() => navigate(`${AppRoute.Volunteers}/${volunteer.id}`)}
                >
                  <Td data-label={text.fields.name}>
                    {volunteer.name}
                    {!volunteer.active && ' (desabilitado)'}
                  </Td>
                </Tr>
              )}
            </DraggableVolunteer>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );

  return (
    <div>
      <PageHeader title="Voluntários" back action={<Button onClick={openAddModal}>Adicionar</Button>} />

      {loading && <Skeleton $h="240px" />}
      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && volunteers.length === 0 && (
        <Empty title="Nenhum voluntário cadastrado" description="Adicione o primeiro pelo botão acima." />
      )}

      {!loading && !error && volunteers.length > 0 && (
        <RoleBoard canMove={canMove} onMove={confirmMove}>
          <Sections>
            {modules.map((group) => (
              <ModuleSection key={group.module} aria-labelledby={`module-${group.module}`}>
                <ModuleTitle id={`module-${group.module}`}>{group.label}</ModuleTitle>
                {group.sections.map((section) => (
                  <RoleDropZone key={section.role} role={section.role}>
                    <Typography type="label">{section.label}</Typography>
                    {section.volunteers.length > 0 ? (
                      renderTable(section.volunteers)
                    ) : (
                      <EmptySectionHint>Nenhum voluntário cadastrado.</EmptySectionHint>
                    )}
                  </RoleDropZone>
                ))}
              </ModuleSection>
            ))}
          </Sections>
        </RoleBoard>
      )}

      {modal}
      {toast}
    </div>
  );
}
