// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  attachToNextWelcomeCoffee,
  getCoffeeAttendanceForPerson,
  hasUpcomingCoffeeEvent,
  markClassInviteDeclined,
  markClassInviteNoResponse,
  markCoffeeAttended,
  markCoffeeNotAttended,
} from '../../../../domain/cafeSchedule';
import {
  ActiveCohort,
  CohortLesson,
  getActiveCohortWithLessons,
  getLessonAttendanceMap,
  getMakeupLink,
  getPersonEnrollmentId,
  promoteToMembershipPending as promoteToMembershipPendingRequest,
  toggleLessonAttendance,
} from '../../../../domain/classesRoster';
import { supabase } from '../../../../lib/supabase';
import { CreateVisitorFormValues, ContactAttemptFormValues } from '../../validators';
import { Person } from '../../types';

interface CoffeeAttendance {
  id: string;
  attended: boolean;
}

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
  const [integrationClass, setIntegrationClass] = useState<IntegrationClassState | null>(null);
  const [integrationLoading, setIntegrationLoading] = useState(false);

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

  const loadCoffeeAttendance = useCallback(async () => {
    setCoffeeLoading(true);
    const attendance = await getCoffeeAttendanceForPerson(id);
    setCoffeeAttendance(attendance);
    setCoffeeLoading(false);
  }, [id]);

  useEffect(() => {
    if (person?.status === 'welcome_coffee') loadCoffeeAttendance();
  }, [person?.status, loadCoffeeAttendance]);

  useEffect(() => {
    if (person?.status === 'initial_contact' || person?.status === 'retry_contact') {
      hasUpcomingCoffeeEvent().then(setHasCoffeeEvent);
    }
  }, [person?.status]);

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

  const changeStatus = async (toStatus: Person['status'], note?: string) => {
    if (!person) return;
    const { error: updateError } = await supabase
      .from('people')
      .update({ status: toStatus, updated_at: new Date().toISOString() })
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

    const toStatus =
      values.result === 'accepted' ? 'welcome_coffee' : values.result === 'declined' ? 'archived' : 'retry_contact';

    // "Sem resposta" keeps the person in the same contact stage for another
    // round — clear the flag so they need to open WhatsApp again before
    // registering that next attempt, instead of the form staying revealed
    // from the attempt that just got a non-response.
    if (values.result === 'no_response') {
      await supabase.from('people').update({ whatsapp_opened_at: null }).eq('id', id);
    }

    await changeStatus(toStatus);

    if (values.result === 'accepted') {
      await attachToNextWelcomeCoffee(id);
    }
  };

  const archive = () => changeStatus('archived');
  const reactivate = async () => {
    await supabase.from('people').update({ whatsapp_opened_at: null }).eq('id', id);
    await changeStatus('retry_contact');
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

  const promoteToMembershipPending = async () => {
    await promoteToMembershipPendingRequest(id, user?.id);
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
    hasCoffeeEvent,
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
  };
}
