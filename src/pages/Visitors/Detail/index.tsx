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
import { LastContactCard } from './components/LastContactCard';
import { MembershipPendingStagePanel } from './components/MembershipPendingStagePanel';
import { PersonCard } from './components/PersonCard';
import { PersonDetailsCard } from './components/PersonDetailsCard';
import { ProgressStepper } from './components/ProgressStepper';
import { useVisitorDetail } from './hooks';
import { Content } from './styles';
import { ContactAttemptFormValues } from '../validators';

export function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const {
    person,
    loading,
    error,
    registerContactAttempt,
    markWhatsAppOpened,
    hasCoffeeEvent,
    hasCohort,
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
    confirmMember,
    profileCoffeeDate,
    profileCohortName,
    lastAttempt,
    editLastContactAttempt,
  } = useVisitorDetail(id ?? '');

  const isAdmin = user?.role === UserRole.Admin;
  const isPastor = user?.role === UserRole.Pastor;
  const canManage = user?.role === UserRole.IntegrationTeam || isAdmin || isPastor;
  const canRecordAttendance = user?.role === UserRole.Teacher || isAdmin || isPastor;
  const canConfirmMembership = isAdmin || isPastor;

  if (loading) return <Skeleton $h="320px" />;
  if (error || !person) return <Empty title="Visitante não encontrado" description={error ?? ''} />;

  const handleRegisterContact = async (values: ContactAttemptFormValues) => {
    await registerContactAttempt(values);
    navigate(AppRoute.Visitors);
  };

  return (
    <Content>
      <PageHeader title={person.name} subtitle="Visitante" back />

      <ProgressStepper status={person.status} />

      <PersonCard person={person} onClick={() => navigate(`${AppRoute.Visitors}/${id}/editar`)} />

      <PersonDetailsCard
        person={person}
        coffeeDate={profileCoffeeDate}
        cohortName={profileCohortName}
        onClick={() => navigate(`${AppRoute.Visitors}/${id}/detalhes`)}
      />

      {canManage && lastAttempt && <LastContactCard result={lastAttempt.result} onSave={editLastContactAttempt} />}

      {canManage && (person.status === 'initial_contact' || person.status === 'retry_contact') && (
        <ContactStagePanel
          person={person}
          volunteerName={user?.name ?? ''}
          hasCoffeeEvent={hasCoffeeEvent}
          onRegisterContact={handleRegisterContact}
          onWhatsAppOpened={markWhatsAppOpened}
        />
      )}

      {canManage && person.status === 'welcome_coffee' && (
        <CoffeeStagePanel
          person={person}
          attendance={coffeeAttendance}
          loading={coffeeLoading}
          hasCohort={hasCohort}
          onMarkAttended={markAttended}
          onMarkNotAttended={markNotAttended}
          onDeclined={markInviteDeclined}
          onNoResponse={markInviteNoResponse}
        />
      )}

      {canRecordAttendance && person.status === 'integration' && (
        <IntegrationStagePanel
          person={person}
          integrationClass={integrationClass}
          loading={integrationLoading}
          canRecordAttendance={canRecordAttendance}
          onToggle={toggleClassAttendance}
          onCopyMakeupLink={getClassMakeupLink}
        />
      )}

      {canConfirmMembership && person.status === 'membership_pending' && (
        <MembershipPendingStagePanel person={person} onConfirm={confirmMember} />
      )}
    </Content>
  );
}
