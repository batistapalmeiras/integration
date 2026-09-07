// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  getCoffeeAttendanceForPerson,
  getPersonAttendedCoffeeDate,
  hasUpcomingCoffeeEvent,
  markClassInviteDeclined,
  markClassInviteNoResponse,
  markCoffeeAttended,
  markCoffeeNotAttended,
} from '../../../domain/cafeSchedule';
import { getPersonCommunityNames } from '../../../domain/communityGroups';
import {
  ActiveCohort,
  CohortLesson,
  getActiveCohortWithLessons,
  getLessonAttendanceMap,
  getMakeupLink,
  getPersonCohortName,
  getPersonEnrollmentId,
  hasActiveCohort,
  toggleLessonAttendance,
} from '../../../domain/classesRoster';
import { confirmMember as confirmMemberUseCase } from '../services/confirmMember';
import { editLastContactAttempt as editLastContactAttemptUseCase } from '../services/editLastContactAttempt';
import { registerContactAttempt as registerContactAttemptUseCase } from '../services/registerContactAttempt';
import {
  clearWhatsAppOpened,
  deletePersonRow,
  fetchLastContactAttempt,
  fetchPerson,
  insertStatusHistory,
  updatePersonFields,
  updatePersonStatus,
} from '../infra/peopleRepository';
import { ContactResult, Person, PersonStatus, UpdatePersonInput } from '../domain/types';

interface CoffeeAttendance {
  id: string;
  attended: boolean;
}

interface ContactAttemptRecord {
  id: string;
  result: ContactResult;
  created_at: string;
}

const CONTACT_STAGES: PersonStatus[] = ['initial_contact', 'retry_contact', 'archived'];

interface IntegrationClassState {
  cohort: ActiveCohort;
  lessons: CohortLesson[];
  enrollmentId: string;
  attendanceByLesson: Record<string, { id: string; attended: boolean }>;
  attendedCount: number;
}

export function useVisitorDetail(id: string) {
  const { user } = useAuthCtx();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coffeeAttendance, setCoffeeAttendance] = useState<CoffeeAttendance | null>(null);
  const [coffeeLoading, setCoffeeLoading] = useState(false);
  const [hasCoffeeEvent, setHasCoffeeEvent] = useState<boolean | null>(null);
  const [hasCohort, setHasCohort] = useState<boolean | null>(null);
  const [integrationClass, setIntegrationClass] = useState<IntegrationClassState | null>(null);
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [profileCoffeeDate, setProfileCoffeeDate] = useState<string | null>(null);
  const [profileCohortName, setProfileCohortName] = useState<string | null>(null);
  const [profileMinistryName, setProfileMinistryName] = useState<string | null>(null);
  const [profileSmallGroupName, setProfileSmallGroupName] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<ContactAttemptRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPerson(await fetchPerson(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar.');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const loadCommunityNames = useCallback(async () => {
    const { ministryName, smallGroupName } = await getPersonCommunityNames(id);
    setProfileMinistryName(ministryName);
    setProfileSmallGroupName(smallGroupName);
  }, [id]);

  // Historical, independent of the person's current pipeline stage — shown
  // on the profile card regardless of whether they're still at that step.
  useEffect(() => {
    getPersonAttendedCoffeeDate(id).then(setProfileCoffeeDate);
    getPersonCohortName(id).then(setProfileCohortName);
    loadCommunityNames();
  }, [id, loadCommunityNames]);

  const loadCoffeeAttendance = useCallback(async () => {
    setCoffeeLoading(true);
    const attendance = await getCoffeeAttendanceForPerson(id);
    setCoffeeAttendance(attendance);
    setCoffeeLoading(false);
  }, [id]);

  useEffect(() => {
    if (person?.status === 'welcome_coffee') {
      loadCoffeeAttendance();
      hasActiveCohort().then(setHasCohort);
    }
  }, [person?.status, loadCoffeeAttendance]);

  useEffect(() => {
    if (person?.status === 'initial_contact' || person?.status === 'retry_contact') {
      hasUpcomingCoffeeEvent().then(setHasCoffeeEvent);
    }
  }, [person?.status]);

  const loadLastAttempt = useCallback(async () => {
    setLastAttempt((await fetchLastContactAttempt(id)) as ContactAttemptRecord | null);
  }, [id]);

  useEffect(() => {
    if (person && CONTACT_STAGES.includes(person.status)) loadLastAttempt();
    else setLastAttempt(null);
  }, [person?.status, loadLastAttempt]);

  const loadIntegrationClass = useCallback(async () => {
    setIntegrationLoading(true);
    const active = await getActiveCohortWithLessons();
    if (!active) {
      setIntegrationClass(null);
      setIntegrationLoading(false);
      return;
    }

    const enrollmentId = await getPersonEnrollmentId(id, active.cohort.id);
    if (!enrollmentId) {
      setIntegrationClass(null);
      setIntegrationLoading(false);
      return;
    }

    const attendanceByLesson = await getLessonAttendanceMap(enrollmentId);
    const attendedCount = Object.values(attendanceByLesson).filter((a) => a.attended).length;
    setIntegrationClass({ cohort: active.cohort, lessons: active.lessons, enrollmentId, attendanceByLesson, attendedCount });
    setIntegrationLoading(false);
  }, [id]);

  useEffect(() => {
    if (person?.status === 'integration') loadIntegrationClass();
  }, [person?.status, loadIntegrationClass]);

  const updatePerson = async (values: UpdatePersonInput) => {
    await updatePersonFields(id, {
      name: values.name.trim(),
      phone: values.phone,
      age: values.age ? Number(values.age) : null,
      email: values.email || null,
      updated_at: new Date().toISOString(),
    });
    await load();
  };

  // Simple, rule-free status setters — archive/reactivate don't branch on
  // anything, so they stay a thin local helper instead of a service.
  const changeStatus = async (toStatus: PersonStatus, note?: string, extra: Record<string, unknown> = {}) => {
    if (!person) return;
    await updatePersonStatus(id, toStatus, extra);
    await insertStatusHistory({ personId: id, fromStatus: person.status, toStatus, changedBy: user?.id, note });
    await load();
  };

  const markWhatsAppOpened = async () => {
    await updatePersonFields(id, { whatsapp_opened_at: new Date().toISOString() });
    await load();
  };

  const registerContactAttempt = async (values: { result: ContactResult }) => {
    if (!person) return;
    await registerContactAttemptUseCase(person, values.result, user?.id);
    await load();
    await loadLastAttempt();
  };

  const editLastContactAttempt = async (result: ContactResult) => {
    if (!lastAttempt || !person) return;
    await editLastContactAttemptUseCase(person, lastAttempt.id, result, user?.id);
    await load();
    await loadLastAttempt();
  };

  const archive = () => changeStatus('archived');
  const reactivate = async () => {
    await clearWhatsAppOpened(id);
    await changeStatus('retry_contact');
  };

  // Only for a mistaken cadastro — RLS only allows this while the person is
  // still at 'initial_contact', before any real history builds up on them.
  const deletePerson = () => deletePersonRow(id);

  const markAttended = async () => {
    if (!coffeeAttendance) return;
    await markCoffeeAttended(coffeeAttendance.id);
    await loadCoffeeAttendance();
  };

  const markNotAttended = async () => {
    await markCoffeeNotAttended(id, user?.id);
    await load();
  };

  const markInviteDeclined = async () => {
    await markClassInviteDeclined(id, user?.id);
    await load();
  };

  const markInviteNoResponse = async () => {
    await markClassInviteNoResponse(id, user?.id);
    await loadCoffeeAttendance();
  };

  const toggleClassAttendance = async (lessonId: string, attended: boolean) => {
    if (!integrationClass) return;
    await toggleLessonAttendance(integrationClass.enrollmentId, lessonId, attended);
    await loadIntegrationClass();
  };

  const getClassMakeupLink = async (lessonId: string): Promise<string> => {
    if (!integrationClass) throw new Error('Turma não carregada');
    return getMakeupLink(integrationClass.enrollmentId, lessonId);
  };

  const confirmMember = async (smallGroupId: string, ministryId: string) => {
    if (!person) return;
    await confirmMemberUseCase(person, smallGroupId, ministryId, user?.id);
    await load();
    await loadCommunityNames();
  };

  // Same PG/Ministério fields confirmMember sets once — this lets
  // pastor/admin revisit them any time afterwards from the Comunidade tab,
  // without touching status.
  const updateCommunity = async (smallGroupId: string, ministryId: string) => {
    await updatePersonFields(id, {
      small_group_id: smallGroupId,
      ministry_id: ministryId,
      updated_at: new Date().toISOString(),
    });
    await loadCommunityNames();
    await load();
  };

  return {
    person,
    loading,
    error,
    updatePerson,
    registerContactAttempt,
    markWhatsAppOpened,
    archive,
    reactivate,
    deletePerson,
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
    updateCommunity,
    profileCoffeeDate,
    profileCohortName,
    profileMinistryName,
    profileSmallGroupName,
    lastAttempt,
    editLastContactAttempt,
  };
}
