// React
import { Navigate, useNavigate, useParams } from 'react-router-dom';
// Libs
import { Empty, Skeleton } from 'bp-kit';
// Components
import { NotFound } from '../../../components/NotFound';
import { NotesPanel } from '../../../components/NotesPanel';
import { WideContent } from '../../../components/PageColumns';
import { OptionsMenuButton } from '../../../components/OptionsMenu';
import { DirectSignupFlag } from '../../../components/DirectSignupFlag';
import { PageHeader } from '../../../components/PageHeader';
import { StatusPill } from '../../../components/StatusPill';
// Local
import { useRole } from '../../../features/access/useRole';
import { AppRoute } from '../../../routes/paths';
import { hasRole, INTEGRATION_TEAM_ROLES, UserRole } from '../../../types/enums';
import { isDirectSignup } from '../../../domain/origin';
import { Person, useVisitorDetail } from '../../../features/visitors';
import { usePersonNotes } from '../../../queries/person';
import { ContactPanel } from './components/ContactPanel';
import { NextStep } from './components/NextStep';
import { PersonDetailsCard } from './components/PersonDetailsCard';
import { ProgressStepper } from './components/ProgressStepper';
import { VisitHistory } from './components/VisitHistory';
import { useVisitorMenu } from './components/useVisitorMenu';
import { ActionArea, Hero, HistoryArea, Layout, MenuSlot, NotesArea, SideArea, StatusLine } from './styles';

export function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const role = useRole();
  const detail = useVisitorDetail(id ?? '');
  const { person, loading, error } = detail;

  if (loading) return <Skeleton $h="320px" />;
  if (error || !person)
    return (
      <NotFound
        title="Cadastro não encontrado"
        description={error ?? ''}
        backTo={AppRoute.Visitors}
        backLabel="Voltar para visitantes"
      />
    );
  if (person.status === 'member') {
    if (role === UserRole.GeneralAdmin) return <Navigate to={`${AppRoute.Members}/${person.id}`} replace />;
    return <Empty title={`${person.name} já é membro`} description="O perfil de membro fica com o Administrador Geral." />;
  }

  return <VisitorDetailContent detail={detail} person={person} />;
}

interface ContentProps {
  detail: ReturnType<typeof useVisitorDetail>;
  person: Person;
}

function VisitorDetailContent({ detail, person }: ContentProps) {
  const navigate = useNavigate();
  const role = useRole();
  const notes = usePersonNotes(person.id).data ?? [];
  const canManage = hasRole(role, INTEGRATION_TEAM_ROLES);
  const menu = useVisitorMenu({
    person,
    canManage,
    onSave: detail.updatePerson,
    onArchive: detail.archive,
    onReactivate: detail.reactivate,
    onDelete: detail.deletePerson,
  });

  return (
    <WideContent>
      <Hero>
        <div>
          <PageHeader title={person.name} back />
          <StatusLine>
            <StatusPill person={person} />
            {isDirectSignup(person.origin) && <DirectSignupFlag />}
            <MenuSlot>
              <OptionsMenuButton label="Mais ações" onClick={menu.openMenu} />
            </MenuSlot>
          </StatusLine>
        </div>
        <ProgressStepper status={person.status} />
      </Hero>

      <Layout>
        <ActionArea>
          <NextStep detail={detail} onContactRegistered={() => navigate(AppRoute.Visitors)} />
        </ActionArea>
        <SideArea>
          <ContactPanel person={person} onEdit={menu.openEdit} />
          <PersonDetailsCard person={person} onClick={() => navigate(`${AppRoute.Visitors}/${person.id}/detalhes`)} />
        </SideArea>
        <NotesArea>
          <NotesPanel personId={person.id} notes={notes} />
        </NotesArea>
        <HistoryArea>
          <VisitHistory person={person} profile={detail.profile} />
        </HistoryArea>
      </Layout>
      {menu.overlays}
    </WideContent>
  );
}
