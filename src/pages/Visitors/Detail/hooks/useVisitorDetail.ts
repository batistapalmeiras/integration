// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  attachToNextWelcomeCoffee,
  getCoffeeAttendanceForPerson,
  getPersonAttendedCoffeeDate,
  hasUpcomingCoffeeEvent,
  markClassInviteDeclined,
  markClassInviteNoResponse,
  markCoffeeAttended,
  markCoffeeNotAttended,
} from '../../../../domain/cafeSchedule';
import { getPersonCommunityNames } from '../../../../domain/communityGroups';
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
} from '../../../../domain/classesRoster';
import { supabase } from '../../../../lib/supabase';
import { CreateVisitorFormValues, ContactAttemptFormValues } from '../../validators';
import { ContactResult, Person } from '../../types';

interface CoffeeAttendance {
  id: string;
  attended: boolean;
}

interface ContactAttemptRecord {
  id: string;
  result: ContactResult;
  created_at: string;
}

const CONTACT_STAGES: Person['status'][] = ['initial_contact', 'retry_contact', 'archived'];

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
    const { data, error: loadError } = await supabase.from('people').select('*').eq('id', id).single();
    if (loadError) setError(loadError.message);
    else setPerson(data as Person);
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
    const { data } = await supabase
      .from('contact_attempts')
      .select('id, result, created_at')
      .eq('person_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setLastAttempt(data as ContactAttemptRecord | null);
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

  const updatePerson = async (values: CreateVisitorFormValues) => {
    const { error: updateError } = await supabase
      .from('people')
      .update({
        name: values.name.trim(),
        phone: values.phone,
        age: values.age ? Number(values.age) : null,
        email: values.email || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (updateError) throw updateError;
    await load();
  };

  const changeStatus = async (toStatus: Person['status'], note?: string, extra: Record<string, unknown> = {}) => {
    if (!person) return;
    const { error: updateError } = await supabase
      .from('people')
      .update({ status: toStatus, updated_at: new Date().toISOString(), ...extra })
      .eq('id', id);
    if (updateError) throw updateError;

    await supabase.from('status_history').insert({
      person_id: id,
      from_status: person.status,
      to_status: toStatus,
      changed_by: user?.id,
      note: note || null,
    });

    await load();
  };

  const markWhatsAppOpened = async () => {
    const { error: updateError } = await supabase
      .from('people')
      .update({ whatsapp_opened_at: new Date().toISOString() })
      .eq('id', id);
    if (updateError) throw updateError;
    await load();
  };

  const registerContactAttempt = async (values: ContactAttemptFormValues) => {
    // Contact is always made via WhatsApp by the volunteer — no channel choice in the UI.
    const { error: attemptError } = await supabase.from('contact_attempts').insert({
      person_id: id,
      channel: 'text',
      result: values.result,
      made_by: user?.id,
    });
    if (attemptError) throw attemptError;

    // A no-show at the café gets exactly one retry-contact round (see
    // markCoffeeNotAttended) — "sem resposta" here archives instead of
    // looping again, unlike the normal pre-café retry loop, which is
    // unlimited.
    const exhaustedCoffeeRetry = values.result === 'no_response' && !!person?.coffee_retry_used;
    const toStatus =
      values.result === 'accepted'
        ? 'welcome_coffee'
        : values.result === 'declined' || exhaustedCoffeeRetry
          ? 'archived'
          : 'retry_contact';

    // "Sem resposta" keeps the person in the same contact stage for another
    // round — clear the flag so they need to open WhatsApp again before
    // registering that next attempt, instead of the form staying revealed
    // from the attempt that just got a non-response.
    if (values.result === 'no_response' && !exhaustedCoffeeRetry) {
      await supabase.from('people').update({ whatsapp_opened_at: null }).eq('id', id);
    }

    // The one-shot flag is consumed by this attempt either way — a fresh
    // retry_contact loop afterwards (e.g. a later manual reactivate) is the
    // normal unlimited kind again.
    await changeStatus(
      toStatus,
      exhaustedCoffeeRetry ? 'Sem resposta na retomada de contato após o café' : undefined,
      { coffee_retry_used: false },
    );

    if (values.result === 'accepted') {
      await attachToNextWelcomeCoffee(id);
    }

    await loadLastAttempt();
  };

  // Lets a volunteer correct a mis-registered contact result — re-applies
  // the same outcome mapping registerContactAttempt uses, as an update
  // instead of a new attempt.
  const editLastContactAttempt = async (result: ContactResult) => {
    if (!lastAttempt) return;
    const { error: updateError } = await supabase.from('contact_attempts').update({ result }).eq('id', lastAttempt.id);
    if (updateError) throw updateError;

    const toStatus = result === 'accepted' ? 'welcome_coffee' : result === 'declined' ? 'archived' : 'retry_contact';
    await changeStatus(toStatus, 'Correção do registro de contato anterior', { coffee_retry_used: false });

    if (result === 'accepted') {
      await attachToNextWelcomeCoffee(id);
    }

    await loadLastAttempt();
  };

  const archive = () => changeStatus('archived');
  const reactivate = async () => {
    await supabase.from('people').update({ whatsapp_opened_at: null }).eq('id', id);
    await changeStatus('retry_contact');
  };

  // Only for a mistaken cadastro — RLS only allows this while the person is
  // still at 'initial_contact', before any real history builds up on them.
  const deletePerson = async () => {
    const { error: deleteError } = await supabase.from('people').delete().eq('id', id);
    if (deleteError) throw deleteError;
  };

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
    const { error: updateError } = await supabase
      .from('people')
      .update({ status: 'member', small_group_id: smallGroupId, ministry_id: ministryId, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (updateError) throw updateError;

    await supabase.from('status_history').insert({
      person_id: id,
      from_status: 'membership_pending',
      to_status: 'member',
      changed_by: user?.id,
    });

    await load();
    await loadCommunityNames();
  };

  // Same PG/Ministério fields confirmMember sets once — this lets
  // pastor/admin revisit them any time afterwards from the Comunidade tab,
  // without touching status.
  const updateCommunity = async (smallGroupId: string, ministryId: string) => {
    const { error: updateError } = await supabase
      .from('people')
      .update({ small_group_id: smallGroupId, ministry_id: ministryId, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (updateError) throw updateError;
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
