// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { createOrUpdateCoffeeEvent, markCoffeeAttended, markCoffeeNotAttended } from '../../../domain/cafeSchedule';
import { supabase } from '../../../lib/supabase';
import { AttendeeRow, CoffeeEvent } from '../types';

export function useCoffee() {
  const { user } = useAuthCtx();
  const [event, setEvent] = useState<CoffeeEvent | null>(null);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

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
    await createOrUpdateCoffeeEvent(eventDate);
    await load();
  };

  const markAttended = async (attendanceId: string) => {
    await markCoffeeAttended(attendanceId);
    await load();
  };

  const markNotAttended = async (personId: string) => {
    await markCoffeeNotAttended(personId, user?.id);
    await load();
  };

  return {
    event,
    attendees,
    loading,
    error,
    createEvent,
    markAttended,
    markNotAttended,
  };
}
