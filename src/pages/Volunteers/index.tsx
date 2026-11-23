// React
import { useState } from 'react';
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
import {
  ChevronDown,
  Church,
  Code,
  GraduationCap,
  LayoutGrid,
  LucideIcon,
  Plus,
  ShieldCheck,
  Sprout,
  UserCog,
  UsersRound,
} from 'lucide-react';
// Components
import { Avatar } from '../../components/Avatar';
import { IconBadge } from '../../components/MenuOptions';
import { PageHeader } from '../../components/PageHeader';
import { TonePill } from '../../components/StatusPill';
// Local
import { useRole } from '../../features/access/useRole';
import { profilePath } from '../../routes/paths';
import { assignableRoles, canChangeRole } from '../../domain/volunteers';
import { groupRolesByModule, ROLE_LABELS, SystemModule, UserRole } from '../../types/enums';
import { VolunteerRow } from '../../repositories/volunteers';
import { AddVolunteerModal } from './components/AddVolunteerModal';
import { DraggableVolunteer, RoleBoard, RoleDropZone } from './components/RoleBoard';
import { useVolunteers } from './hooks/useVolunteers';
import { ModuleFilter, ModuleFilterOption } from './components/ModuleFilter';
import { accessModule } from './persistence';
import {
  EmptySectionHint,
  GroupBody,
  GroupCard,
  GroupLabel,
  GroupName,
  GroupToggle,
  ModuleSection,
  ModuleTitle,
  Modules,
  PersonList,
  PersonName,
  PersonRow,
} from './styles';

const ROLE_SECTION_LABELS: Record<UserRole, string> = {
  [UserRole.Developer]: 'Desenvolvedores',
  [UserRole.GeneralAdmin]: 'Administradores Gerais',
  [UserRole.Admin]: 'Administradores',
  [UserRole.Teacher]: 'Professores',
  [UserRole.IntegrationTeam]: 'Equipe de Integração',
};

const ROLE_ICONS: Record<UserRole, LucideIcon> = {
  [UserRole.GeneralAdmin]: ShieldCheck,
  [UserRole.Developer]: Code,
  [UserRole.Admin]: UserCog,
  [UserRole.Teacher]: GraduationCap,
  [UserRole.IntegrationTeam]: UsersRound,
};

function RoleIcon({ role }: { role: UserRole }) {
  const Icon = ROLE_ICONS[role];
  return <Icon size={20} aria-hidden="true" />;
}

const ALL_MODULES = 'all';

const MODULE_ICONS: Record<SystemModule, LucideIcon> = {
  [SystemModule.Church]: Church,
  [SystemModule.Integration]: Sprout,
};

const MODULE_GROUPS = groupRolesByModule([
  UserRole.GeneralAdmin,
  UserRole.Developer,
  UserRole.Admin,
  UserRole.Teacher,
  UserRole.IntegrationTeam,
]);

export function VolunteersPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const role = useRole();
  const { volunteers, loading, error, addVolunteer, changeRole } = useVolunteers();
  const { open, close, modal } = useModal('drawer');
  const { show: showToast, toast } = useToast();
  const [savedModule, setSavedModule] = useState(() => accessModule.load());
  const [openRoles, setOpenRoles] = useState<UserRole[]>(() => MODULE_GROUPS.map((group) => group.roles[0]));

  const allowedRoles = assignableRoles(role);
  const actor = { id: user?.id ?? '', role: role ?? '' };
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
  const selected = modules.find((group) => group.module === savedModule)?.module ?? ALL_MODULES;
  const visibleModules = selected === ALL_MODULES ? modules : modules.filter((group) => group.module === selected);

  const filterOptions: ModuleFilterOption[] = [
    { value: ALL_MODULES, label: 'Todos os Módulos', icon: LayoutGrid, count: volunteers.length },
    ...modules.map((group) => ({
      value: group.module,
      label: group.label,
      icon: MODULE_ICONS[group.module],
      count: group.sections.reduce((sum, section) => sum + section.volunteers.length, 0),
    })),
  ];

  const isOpen = (role: UserRole) => openRoles.includes(role);
  const toggleRole = (role: UserRole) =>
    setOpenRoles((current) => (current.includes(role) ? current.filter((item) => item !== role) : [...current, role]));

  const chooseModule = (module: string) => {
    setSavedModule(module);
    accessModule.save(module);
  };

  const renderPeople = (rows: VolunteerRow[]) => (
    <PersonList>
      {rows.map((volunteer) => (
        <li key={volunteer.id}>
          <DraggableVolunteer volunteer={volunteer} enabled={canDrag(volunteer)}>
            {({ ref, dragProps, isDragging }) => (
              <PersonRow
                ref={ref}
                type="button"
                {...dragProps}
                style={{ opacity: isDragging ? 0.4 : 1, touchAction: canDrag(volunteer) ? 'pan-y' : undefined }}
                onClick={() => navigate(profilePath(volunteer.id))}
              >
                <Avatar name={volunteer.name} size={36} muted={volunteer.membershipStatus !== 'active'} />
                <PersonName>{volunteer.name}</PersonName>
                {volunteer.membershipStatus !== 'active' && <TonePill $tone="neutral">Sem acesso</TonePill>}
              </PersonRow>
            )}
          </DraggableVolunteer>
        </li>
      ))}
    </PersonList>
  );

  return (
    <div>
      <PageHeader
        title="Controle de acesso"
        back
        action={
          <Button variant="secondary" onClick={openAddModal}>
            <Plus size={16} />
            Adicionar
          </Button>
        }
      />

      {loading && <Skeleton $h="240px" />}
      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && volunteers.length === 0 && (
        <Empty title="Nenhum usuário cadastrado" description="Adicione o primeiro pelo botão acima." />
      )}

      {!loading && !error && volunteers.length > 0 && (
        <>
          <ModuleFilter options={filterOptions} value={selected} onChange={chooseModule} />

          <RoleBoard canMove={canMove} onMove={confirmMove}>
            <Modules>
              {visibleModules.map((group) => (
                <ModuleSection key={group.module} aria-label={group.label}>
                  {selected === ALL_MODULES && <ModuleTitle>{group.label}</ModuleTitle>}
                  {group.sections.map((section) => (
                    <RoleDropZone key={section.role} role={section.role}>
                      <GroupCard>
                        <GroupLabel>
                          <GroupToggle
                            type="button"
                            $open={isOpen(section.role)}
                            aria-expanded={isOpen(section.role)}
                            onClick={() => toggleRole(section.role)}
                          >
                            <IconBadge>
                              <RoleIcon role={section.role} />
                            </IconBadge>
                            <GroupName>{section.label}</GroupName>
                            <ChevronDown size={20} aria-hidden="true" />
                          </GroupToggle>
                        </GroupLabel>
                        {isOpen(section.role) && (
                          <GroupBody>
                            {section.volunteers.length > 0 ? (
                              renderPeople(section.volunteers)
                            ) : (
                              <EmptySectionHint>Ninguém por aqui.</EmptySectionHint>
                            )}
                          </GroupBody>
                        )}
                      </GroupCard>
                    </RoleDropZone>
                  ))}
                </ModuleSection>
              ))}
            </Modules>
          </RoleBoard>
        </>
      )}

      {modal}
      {toast}
    </div>
  );
}
