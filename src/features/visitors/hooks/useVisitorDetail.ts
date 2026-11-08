// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  getCoffeeAttendanceForPerson,
  markClassInviteDeclined,
  markClassInviteNoResponse,
  markCoffeeAttended,
  markCoffeeNotAttended,
} from '../../../repositories/cafeSchedule';
import { PersonIntegrationClass } from '../../../domain/classesRoster';
import { getMakeupLink, getPersonIntegrationClass, toggleLessonAttendance } from '../../../repositories/classesRoster';
import { setQueryData, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { useHasUpcomingCoffeeEvent, useHasUpcomingCohort } from '../../../queries/reference';
import { editLastContactAttempt as editLastContactAttemptUseCase } from '../services/editLastContactAttempt';
import { registerContactAttempt as registerContactAttemptUseCase } from '../services/registerContactAttempt';
import { fetchLastContactAttempt } from '../../../repositories/people';
import { ContactResult, PersonStatus } from '../domain/types';
import { useVisitorProfile } from './useVisitorProfile';

interface ContactAttemptRecord {
  id: string;
  result: ContactResult;
  created_at: string;
}

const CONTACT_STAGES: PersonStatus[] = ['initial_contact', 'retry_contact', 'archived'];
const COFFEE_STAGES: PersonStatus[] = ['welcome_coffee', 'pending_signup'];
const CONTACT_PANEL_STAGES: PersonStatus[] = ['initial_contact', 'retry_contact'];

function countAttended(attendanceByLesson: PersonIntegrationClass['attendanceByLesson']): number {
  return Object.values(attendanceByLesson).filter((a) => a.attended).length;
}

export function useVisitorDetail(id: string) {
  const { user } = useAuthCtx();
  const profile = useVisitorProfile(id);
  const { person, setPerson, reload, updateFields } = profile;
  const status = person?.status ?? '';
  const inCoffeeStage = COFFEE_STAGES.includes(status as PersonStatus);

  const coffeeQuery = useQuery(queryKeys.personCoffeeAttendance(id, status), () => getCoffeeAttendanceForPerson(id), {
    enabled: inCoffeeStage,
  });
  const coffeeAttendance = inCoffeeStage ? (coffeeQuery.data ?? null) : null;
  const hasCohort = useHasUpcomingCohort(inCoffeeStage).data ?? null;
  const hasCoffeeEvent = useHasUpcomingCoffeeEvent(CONTACT_PANEL_STAGES.includes(status as PersonStatus)).data ?? null;

  const inContactStage = CONTACT_STAGES.includes(status as PersonStatus);
  const lastAttemptQuery = useQuery(
    queryKeys.personLastContactAttempt(id, status),
    async () => (await fetchLastContactAttempt(id)) as ContactAttemptRecord | null,
    { enabled: inContactStage },
  );
  const lastAttempt = inContactStage ? (lastAttemptQuery.data ?? null) : null;

  const integrationQuery = useQuery(queryKeys.personIntegrationClass(id), () => getPersonIntegrationClass(id), {
    enabled: status === 'integration',
  });
  const integrationClass = integrationQuery.data
    ? { ...integrationQuery.data, attendedCount: countAttended(integrationQuery.data.attendanceByLesson) }
    : null;

  const markWhatsAppOpened = () => updateFields({ whatsapp_opened_at: new Date().toISOString() });
  const markClassInviteSent = () => updateFields({ class_invite_sent_at: new Date().toISOString() });
  const markMembershipInterestSent = () => updateFields({ membership_interest_sent_at: new Date().toISOString() });

  const registerContactAttempt = async (values: { result: ContactResult }) => {
    if (!person) return;
    setPerson(await registerContactAttemptUseCase(person, values.result, user?.id));
  };

  const editLastContactAttempt = async (result: ContactResult) => {
    if (!lastAttempt || !person) return;
    const updated = await editLastContactAttemptUseCase(person, lastAttempt.id, result, user?.id);
    setPerson(updated);
    setQueryData(queryKeys.personLastContactAttempt(id, updated.status), { ...lastAttempt, result });
  };

  const markAttended = async () => {
    if (!coffeeAttendance) return;
    await markCoffeeAttended(coffeeAttendance.id, id, user?.id);
    await reload();
  };

  const markNotAttended = async () => {
    await markCoffeeNotAttended(id, user?.id);
    await reload();
  };

  const markInviteDeclined = async () => {
    await markClassInviteDeclined(id, user?.id);
    await reload();
  };

  const markInviteNoResponse = async () => {
    await markClassInviteNoResponse(id, user?.id);
    await coffeeQuery.refetch();
  };

  const toggleClassAttendance = async (lessonId: string, attended: boolean) => {
    if (!integrationClass) return;
    const saved = await toggleLessonAttendance(integrationClass.enrollmentId, lessonId, attended);
    setQueryData<PersonIntegrationClass | null>(queryKeys.personIntegrationClass(id), (current) =>
      current ? { ...current, attendanceByLesson: { ...current.attendanceByLesson, [lessonId]: saved } } : null,
    );
  };

  const getClassMakeupLink = async (lessonId: string): Promise<string> => {
    if (!integrationClass) throw new Error('Turma não carregada');
    return getMakeupLink(integrationClass.enrollmentId, lessonId);
  };

  return {
    ...profile,
    registerContactAttempt,
    markWhatsAppOpened,
    markClassInviteSent,
    markMembershipInterestSent,
    hasCoffeeEvent,
    hasCohort,
    coffeeAttendance,
    coffeeLoading: coffeeQuery.loading,
    markAttended,
    markNotAttended,
    markInviteDeclined,
    markInviteNoResponse,
    integrationClass,
    integrationLoading: integrationQuery.loading,
    toggleClassAttendance,
    getClassMakeupLink,
    lastAttempt,
    editLastContactAttempt,
  };
}
