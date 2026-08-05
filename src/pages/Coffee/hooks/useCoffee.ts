// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { supabase } from '../../../lib/supabase';
import { Person } from '../../../types/person';
import { ActiveCohort, AttendeeRow, CoffeeAttendance, CoffeeEvent } from '../types';

export function useCoffee() {
  const { user } = useAuthCtx();
  const [event, setEvent] = useState<CoffeeEvent | null>(null);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [pendingPeople, setPendingPeople] = useState<Person[]>([]);
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
      setPendingPeople([]);
      setLoading(false);
      return;
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

    const attachedIds = new Set((attendanceData ?? []).map((a) => a.person_id as string));
    const { data: peopleData, error: peopleError } = await supabase
      .from('people')
      .select('*')
      .eq('status', 'welcome_coffee');

    if (peopleError) {
      setError(peopleError.message);
      setLoading(false);
      return;
    }

    setPendingPeople((peopleData as Person[]).filter((p) => !attachedIds.has(p.id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createEvent = async (eventDate: string) => {
    const { error: insertError } = await supabase.from('coffee_events').insert({ event_date: eventDate });
    if (insertError) throw insertError;
    await load();
  };

  const addPersonToEvent = async (personId: string) => {
    if (!event) return;
    const { error: insertError } = await supabase.from('coffee_attendance').insert({
      person_id: personId,
      coffee_event_id: event.id,
    });
    if (insertError) throw insertError;
    await load();
  };

  const updateAttendance = async (
    attendance: AttendeeRow,
    patch: Partial<Pick<CoffeeAttendance, 'confirmed' | 'attended' | 'presented_by_pastor'>>,
  ) => {
    const { error: updateError } = await supabase.from('coffee_attendance').update(patch).eq('id', attendance.id);
    if (updateError) throw updateError;
    await load();
  };

  const inviteToClasses = async (attendance: AttendeeRow) => {
    if (!activeCohort) return;

    const { error: enrollError } = await supabase.from('enrollments').insert({
      person_id: attendance.person.id,
      cohort_id: activeCohort.id,
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
      note: `Convidado para a turma "${activeCohort.name}"`,
    });

    await load();
  };

  return {
    event,
    attendees,
    pendingPeople,
    activeCohort,
    loading,
    error,
    createEvent,
    addPersonToEvent,
    updateAttendance,
    inviteToClasses,
  };
}
