// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { findOrCreateCoffeeEvent } from '../../../domain/cafeSchedule';
import { supabase } from '../../../lib/supabase';
import { ActiveCohort, AttendeeRow, CoffeeEvent } from '../types';

export function useCoffee() {
  const { user } = useAuthCtx();
  const [event, setEvent] = useState<CoffeeEvent | null>(null);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [activeCohort, setActiveCohort] = useState<ActiveCohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: cohortData } = await supabase.from('cohorts').select('id,name').eq('status', 'active').maybeSingle();
    setActiveCohort((cohortData as ActiveCohort | null) ?? null);

    const { data: events, error: eventsError } = await supabase
      .from('coffee_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (eventsError) {
      setError(eventsError.message);
      setLoading(false);
      return;
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const list = (events ?? []) as CoffeeEvent[];
    const currentEvent = list.find((e) => e.event_date >= todayKey) ?? list[list.length - 1] ?? null;
    setEvent(currentEvent);

    if (!currentEvent) {
      setAttendees([]);
      setLoading(false);
      return;
    }

    // Self-heal: a person can reach 'welcome_coffee' status without an
    // attendance row (e.g. legacy data from before auto-attach existed) —
    // attach them here so nothing needs a separate "pending" list/step.
    const { data: welcomePeople, error: peopleError } = await supabase
      .from('people')
      .select('id')
      .eq('status', 'welcome_coffee');

    if (peopleError) {
      setError(peopleError.message);
      setLoading(false);
      return;
    }

    const { data: existingAttendance, error: existingError } = await supabase
      .from('coffee_attendance')
      .select('person_id')
      .eq('coffee_event_id', currentEvent.id);

    if (existingError) {
      setError(existingError.message);
      setLoading(false);
      return;
    }

    const attachedIds = new Set((existingAttendance ?? []).map((a) => a.person_id as string));
    const missing = (welcomePeople ?? []).filter((p) => !attachedIds.has(p.id));
    if (missing.length > 0) {
      await supabase
        .from('coffee_attendance')
        .insert(missing.map((p) => ({ person_id: p.id, coffee_event_id: currentEvent.id })));
    }

    const { data: attendanceData, error: attendanceError } = await supabase
      .from('coffee_attendance')
      .select('*, person:people(id,name,phone,status)')
      .eq('coffee_event_id', currentEvent.id);

    if (attendanceError) {
      setError(attendanceError.message);
      setLoading(false);
      return;
    }

    // Once a person moves past the café stage (invited to classes, archived, etc.)
    // they're another volunteer's queue now — stop showing them here.
    const rows = (attendanceData ?? []) as unknown as AttendeeRow[];
    setAttendees(rows.filter((a) => a.person.status === 'welcome_coffee'));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createEvent = async (eventDate: string) => {
    await findOrCreateCoffeeEvent(eventDate);
    await load();
  };

  // Enrolls a café attendee into a cohort and advances their status — shared
  // by the auto-enroll-on-attendance path and the manual fallback button for
  // people who attended before a cohort was open.
  const enrollInCohort = async (attendance: AttendeeRow, cohort: ActiveCohort) => {
    const { error: enrollError } = await supabase.from('enrollments').insert({
      person_id: attendance.person.id,
      cohort_id: cohort.id,
    });
    if (enrollError) throw enrollError;

    const { error: statusError } = await supabase
      .from('people')
      .update({ status: 'integration', updated_at: new Date().toISOString() })
      .eq('id', attendance.person.id);
    if (statusError) throw statusError;

    await supabase.from('status_history').insert({
      person_id: attendance.person.id,
      from_status: 'welcome_coffee',
      to_status: 'integration',
      changed_by: user?.id,
      note: `Convidado para a turma "${cohort.name}"`,
    });

    await load();
  };

  const markAttended = async (attendance: AttendeeRow) => {
    const { error: updateError } = await supabase.from('coffee_attendance').update({ attended: true }).eq('id', attendance.id);
    if (updateError) throw updateError;

    // If there's an open cohort right now, attending the café already
    // enrolls the person — no separate manual "invite" click needed. If
    // there isn't one yet, they stay visible with a manual invite option
    // for whenever a cohort opens (see inviteToClasses below).
    if (activeCohort) {
      await enrollInCohort(attendance, activeCohort);
    } else {
      await load();
    }
  };

  const markNotAttended = async (attendance: AttendeeRow) => {
    const { error: statusError } = await supabase
      .from('people')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', attendance.person.id);
    if (statusError) throw statusError;

    await supabase.from('status_history').insert({
      person_id: attendance.person.id,
      from_status: 'welcome_coffee',
      to_status: 'archived',
      changed_by: user?.id,
      note: 'Não compareceu ao café de boas-vindas',
    });

    await load();
  };

  const inviteToClasses = async (attendance: AttendeeRow) => {
    if (!activeCohort) return;
    await enrollInCohort(attendance, activeCohort);
  };

  return {
    event,
    attendees,
    activeCohort,
    loading,
    error,
    createEvent,
    markAttended,
    markNotAttended,
    inviteToClasses,
  };
}
