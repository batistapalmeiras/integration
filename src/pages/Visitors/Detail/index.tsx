// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Empty, PageHeader, Skeleton, useAuthCtx } from 'bp-kit';
// Local
import { AppRoute } from '../../../routes/paths';
import { UserRole } from '../../../types/enums';
import { ContactStagePanel } from './components/ContactStagePanel';
import { CoffeeStagePanel } from './components/CoffeeStagePanel';
import { IntegrationStagePanel } from './components/IntegrationStagePanel';
import { PersonCard } from './components/PersonCard';
import { ProgressStepper } from './components/ProgressStepper';
import { useVisitorDetail } from './hooks';
import { Content, Hint } from './styles';

const STAGE_HINTS: Partial<Record<string, string>> = {
  membership_pending: 'Aguardando confirmação do Pastor na tela de Admin.',
  member: 'Processo de integração concluído.',
};

export function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const {
    person,
    loading,
    error,
    registerContactAttempt,
    coffeeAttendance,
    coffeeLoading,
    markAttended,
    markNotAttended,
    markInviteDeclined,
    markInviteNoResponse,
    integrationClass,
    integrationLoading,
    toggleClassAttendance,
    getClassMakeupLink,
    promoteToMembershipPending,
  } = useVisitorDetail(id ?? '');

  const isAdmin = user?.role === UserRole.Admin;
  const canManage = user?.role === UserRole.IntegrationTeam || isAdmin;
  const canRecordAttendance = user?.role === UserRole.Teacher || isAdmin;

  if (loading) return <Skeleton $h="320px" />;
  if (error || !person) return <Empty title="Visitante não encontrado" description={error ?? ''} />;

  return (
    <Content>
      <PageHeader title={person.name} subtitle="Visitante" back />

      <ProgressStepper status={person.status} />

      <PersonCard person={person} onClick={() => navigate(`${AppRoute.Visitors}/${id}/editar`)} />

      {canManage && (person.status === 'initial_contact' || person.status === 'retry_contact') && (
        <ContactStagePanel person={person} onRegisterContact={registerContactAttempt} />
      )}

      {canManage && person.status === 'welcome_coffee' && (
        <CoffeeStagePanel
          person={person}
          attendance={coffeeAttendance}
          loading={coffeeLoading}
          onMarkAttended={markAttended}
          onMarkNotAttended={markNotAttended}
          onDeclined={markInviteDeclined}
          onNoResponse={markInviteNoResponse}
        />
      )}

      {canRecordAttendance && person.status === 'integration' && (
        <IntegrationStagePanel
          integrationClass={integrationClass}
          loading={integrationLoading}
          canRecordAttendance={canRecordAttendance}
          isAdmin={isAdmin}
          onToggle={toggleClassAttendance}
          onCopyMakeupLink={getClassMakeupLink}
          onPromote={promoteToMembershipPending}
        />
      )}

      {canManage && STAGE_HINTS[person.status] && <Hint>{STAGE_HINTS[person.status]}</Hint>}
    </Content>
  );
}
