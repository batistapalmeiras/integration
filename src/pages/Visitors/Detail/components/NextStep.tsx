// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { useVisitorDetail } from '../../../../features/visitors';
import { hasRole, INTEGRATION_TEAM_ROLES, TEACHING_ROLES, UserRole } from '../../../../types/enums';
import { ContactAttemptFormValues } from '../../validators';
import { CoffeeStagePanel } from './CoffeeStagePanel';
import { ContactStagePanel } from './ContactStagePanel';
import { IntegrationStagePanel } from './IntegrationStagePanel';
import { LastContactCard } from './LastContactCard';
import { MembershipPendingStagePanel } from './MembershipPendingStagePanel';

interface Props {
  detail: ReturnType<typeof useVisitorDetail>;
  onContactRegistered: () => void;
}

export function NextStep({ detail, onContactRegistered }: Props) {
  const { user } = useAuthCtx();
  const { person } = detail;
  if (!person) return null;

  const isPastor = user?.role === UserRole.Pastor;
  const canManage = hasRole(user?.role, INTEGRATION_TEAM_ROLES);
  const canRecordAttendance = hasRole(user?.role, TEACHING_ROLES);

  const handleRegisterContact = async (values: ContactAttemptFormValues) => {
    await detail.registerContactAttempt(values);
    onContactRegistered();
  };

  return (
    <>
      {canManage && detail.lastAttempt && (
        <LastContactCard result={detail.lastAttempt.result} onSave={detail.editLastContactAttempt} />
      )}

      {canManage && (person.status === 'initial_contact' || person.status === 'retry_contact') && (
        <ContactStagePanel
          person={person}
          volunteerName={user?.name ?? ''}
          hasCoffeeEvent={detail.hasCoffeeEvent}
          onRegisterContact={handleRegisterContact}
          onWhatsAppOpened={detail.markWhatsAppOpened}
        />
      )}

      {canManage && (person.status === 'welcome_coffee' || person.status === 'pending_signup') && (
        <CoffeeStagePanel
          person={person}
          attendance={detail.coffeeAttendance}
          loading={detail.coffeeLoading}
          hasCohort={detail.hasCohort}
          onMarkAttended={detail.markAttended}
          onMarkNotAttended={detail.markNotAttended}
          onDeclined={detail.markInviteDeclined}
          onNoResponse={detail.markInviteNoResponse}
          onClassInviteSent={detail.markClassInviteSent}
        />
      )}

      {canRecordAttendance && person.status === 'integration' && (
        <IntegrationStagePanel
          person={person}
          integrationClass={detail.integrationClass}
          loading={detail.integrationLoading}
          canRecordAttendance={canRecordAttendance}
          onToggle={detail.toggleClassAttendance}
          onGetMakeupLink={detail.getClassMakeupLink}
          onMembershipInterestSent={detail.markMembershipInterestSent}
        />
      )}

      {isPastor && person.status === 'membership_pending' && (
        <MembershipPendingStagePanel person={person} onConfirm={detail.confirmMember} />
      )}
    </>
  );
}
