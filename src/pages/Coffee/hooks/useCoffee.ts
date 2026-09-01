// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  createOrUpdateCoffeeEvent,
  markCoffeeAttended,
  markCoffeeCanceled,
  markCoffeeNotAttended,
} from '../../../domain/cafeSchedule';
import { supabase } from '../../../lib/supabase';
import { comparePeopleByPipeline } from '../../../types/person';
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
    setAttendees(
      rows.filter((a) => a.person.status === 'welcome_coffee').sort((a, b) => comparePeopleByPipeline(a.person, b.person)),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createEvent = async (eventDate: string) => {
    await createOrUpdateCoffeeEvent(eventDate);
    await load();
  };

  const deleteEvent = async () => {
    if (!event) return;
    const { error: deleteError } = await supabase.from('coffee_events').delete().eq('id', event.id);
    if (deleteError) throw deleteError;
    await load();
  };

  // These three patch `attendees` in place instead of re-running `load()` —
  // re-fetching would flip `loading` back to true and flash/replace the
  // whole table for a change that only ever affects a single row.
  const markAttended = async (attendanceId: string) => {
    await markCoffeeAttended(attendanceId);
    setAttendees((prev) => prev.map((a) => (a.id === attendanceId ? { ...a, attended: true } : a)));
  };

  const markNotAttended = async (personId: string) => {
    await markCoffeeNotAttended(personId, user?.id);
    setAttendees((prev) => prev.filter((a) => a.person.id !== personId));
  };

  const markCanceled = async (personId: string) => {
    await markCoffeeCanceled(personId, user?.id);
    setAttendees((prev) => prev.filter((a) => a.person.id !== personId));
  };

  return {
    event,
    attendees,
    loading,
    error,
    createEvent,
    deleteEvent,
    markAttended,
    markNotAttended,
    markCanceled,
  };
}
