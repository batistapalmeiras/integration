// React
import { Navigate, useNavigate, useParams } from 'react-router-dom';
// Libs
import { Empty, Skeleton, useAuthCtx } from 'bp-kit';
// Components
import { NotFound } from '../../../components/NotFound';
import { NotesPanel } from '../../../components/NotesPanel';
import { WideContent } from '../../../components/PageColumns';
import { OptionsMenuButton } from '../../../components/OptionsMenu';
import { PageHeader } from '../../../components/PageHeader';
import { StatusPill } from '../../../components/StatusPill';
// Local
import { AppRoute } from '../../../routes/paths';
import { hasRole, INTEGRATION_TEAM_ROLES, UserRole } from '../../../types/enums';
import { Person, useVisitorDetail } from '../../../features/visitors';
import { usePersonNotes } from '../../../queries/person';
import { ContactPanel } from './components/ContactPanel';
import { NextStep } from './components/NextStep';
import { PersonDetailsCard } from './components/PersonDetailsCard';
import { ProgressStepper } from './components/ProgressStepper';
import { VisitHistory } from './components/VisitHistory';
import { useVisitorMenu } from './components/useVisitorMenu';
import { ActionArea, Hero, Layout, NotesArea, SideArea, StatusLine } from './styles';

export function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthCtx();
  const detail = useVisitorDetail(id ?? '');
  const { person, loading, error } = detail;

  if (loading) return <Skeleton $h="320px" />;
  if (error || !person) return <NotFound title="Cadastro não encontrado" description={error ?? ''} backTo={AppRoute.Visitors} backLabel="Voltar para visitantes" />;
  if (person.status === 'member') {
    if (user?.role === UserRole.Pastor) return <Navigate to={`${AppRoute.Members}/${person.id}`} replace />;
    return <Empty title={`${person.name} já é membro`} description="O perfil de membro fica com o pastor." />;
  }

  return <VisitorDetailContent detail={detail} person={person} />;
}

interface ContentProps {
  detail: ReturnType<typeof useVisitorDetail>;
  person: Person;
}

function VisitorDetailContent({ detail, person }: ContentProps) {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const notes = usePersonNotes(person.id).data ?? [];
  const canManage = hasRole(user?.role, INTEGRATION_TEAM_ROLES);
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
          <PageHeader
            title={person.name}
            back
            actionAlign="end"
            action={<OptionsMenuButton label="Mais ações" onClick={menu.openMenu} />}
          />
          <StatusLine>
            <StatusPill person={person} />
          </StatusLine>
        </div>
        <ProgressStepper status={person.status} />
      </Hero>

      <Layout>
        <ActionArea>
          <NextStep detail={detail} onContactRegistered={() => navigate(AppRoute.Visitors)} />
          <VisitHistory person={person} profile={detail.profile} />
        </ActionArea>
        <SideArea>
          <ContactPanel person={person} onEdit={menu.openEdit} />
          <PersonDetailsCard person={person} onClick={() => navigate(`${AppRoute.Visitors}/${person.id}/detalhes`)} />
        </SideArea>
        <NotesArea>
          <NotesPanel personId={person.id} notes={notes} />
        </NotesArea>
      </Layout>
      {menu.overlays}
    </WideContent>
  );
}
