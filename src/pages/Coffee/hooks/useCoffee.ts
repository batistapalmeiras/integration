// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  EnrollableCoffeePerson,
  countQueuedByCoffeeEvent,
  enrollInCoffee,
  insertCoffeeEvent,
  markCoffeeAttended,
  markCoffeeCanceled,
  markCoffeeNotAttended,
  selectOpenCoffeeEvents,
  updateCoffeeEventDate,
} from '../../../domain/cafeSchedule';
import { archiveMissedSignups } from '../../../domain/signupDeadline';
import { supabase } from '../../../lib/supabase';
import { UserRole } from '../../../types/enums';
import { comparePeopleByPipeline } from '../../../types/person';
import { loadSavedFilters, saveFilters } from '../persistence';
import { AttendeeRow, CoffeeEvent } from '../types';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
// Enough room to close out the café that just happened while the next one
// is already scheduled — a 3rd one piling up means the previous cycle
// wasn't wrapped up yet, which is its own problem to fix first.
const MAX_EVENTS = 2;

// Always the oldest café (list is sorted ascending by date) — staff should
// land on whichever one is most likely to still need attention, never
// jump straight to a newer one just because it exists.
function resolveDefaultId(list: CoffeeEvent[]): string | null {
  return list[0]?.id ?? null;
}

export function useCoffee() {
  const { user } = useAuthCtx();
  const canSweep =
    user?.role === UserRole.IntegrationTeam || user?.role === UserRole.Pastor || user?.role === UserRole.Admin;
  const [events, setEvents] = useState<CoffeeEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [allAttendees, setAllAttendees] = useState<AttendeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState(() => loadSavedFilters()?.search ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    saveFilters({ search });
  }, [search]);

  // Only the cafés still open: one whose date has passed and whose queue is
  // empty closed itself (see selectOpenCoffeeEvents) — it drops out of the
  // selector and frees up its slot for the next café, exactly as if someone
  // had encerrado it by hand.
  const fetchEvents = useCallback(async (): Promise<CoffeeEvent[] | null> => {
    const { data, error: eventsError } = await supabase
      .from('coffee_events')
      .select('*')
      .order('event_date', { ascending: true });
    if (eventsError) {
      setError(eventsError.message);
      return null;
    }

    const all = (data ?? []) as CoffeeEvent[];
    const queued = await countQueuedByCoffeeEvent();
    const open = selectOpenCoffeeEvents(all, queued, new Date().toISOString().slice(0, 10));
    setEvents(open);
    return open;
  }, []);

  // Self-heal: a person can reach 'welcome_coffee' status without ANY
  // attendance row at all (e.g. legacy data from before auto-attach
  // existed) — attach them to the next upcoming café. Runs independently of
  // whichever café is selected in the dropdown, since an orphaned person
  // should always land on the real next café, not wherever staff happens
  // to be looking at the moment.
  const healOrphans = useCallback(async (list: CoffeeEvent[]) => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const upcomingId = list.find((e) => e.event_date >= todayKey)?.id;
    if (!upcomingId) return;

    const { data: welcomePeople, error: peopleError } = await supabase
      .from('people')
      .select('id')
      .eq('status', 'welcome_coffee');
    if (peopleError) {
      setError(peopleError.message);
      return;
    }

    const { data: everAttended, error: everAttendedError } = await supabase.from('coffee_attendance').select('person_id');
    if (everAttendedError) {
      setError(everAttendedError.message);
      return;
    }

    const everAttachedIds = new Set((everAttended ?? []).map((a) => a.person_id as string));
    const missing = (welcomePeople ?? []).filter((p) => !everAttachedIds.has(p.id));
    if (missing.length > 0) {
      await supabase
        .from('coffee_attendance')
        .insert(missing.map((p) => ({ person_id: p.id, coffee_event_id: upcomingId })));
    }
  }, []);

  const loadAttendeesFor = useCallback(async (eventId: string) => {
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('coffee_attendance')
      .select('*, person:people(id,name,phone,status,class_invite_sent_at)')
      .eq('coffee_event_id', eventId);

    if (attendanceError) {
      setError(attendanceError.message);
      return;
    }

    // welcome_coffee (not yet attended) and pending_signup (attended,
    // waiting on the turma form) are both still this café's queue. Once a
    // person moves past that (invited to classes, archived, etc.) they're
    // another volunteer's queue now — stop showing them here.
    const rows = (attendanceData ?? []) as unknown as AttendeeRow[];
    setAllAttendees(
      rows
        .filter((a) => a.person.status === 'welcome_coffee' || a.person.status === 'pending_signup')
        .sort((a, b) => comparePeopleByPipeline(a.person, b.person)),
    );
    setPage(1);
  }, []);

  const selectEvent = useCallback(
    async (eventId: string) => {
      setLoading(true);
      setSelectedEventId(eventId);
      await loadAttendeesFor(eventId);
      setLoading(false);
    },
    [loadAttendeesFor],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Runs before anything is counted or listed so a café whose last
    // pending person just got archived closes in this same pass, instead of
    // lingering until the next time someone opens the page. Only the roles
    // RLS lets write people rows attempt it — for anyone else the sweep
    // would just fail and blank the page with an error.
    if (canSweep) {
      try {
        await archiveMissedSignups(user?.id);
      } catch (sweepError) {
        setError((sweepError as Error).message);
      }
    }

    const list = await fetchEvents();
    if (!list) {
      setLoading(false);
      return;
    }
    if (list.length === 0) {
      setSelectedEventId(null);
      setAllAttendees([]);
      setLoading(false);
      return;
    }

    await healOrphans(list);
    const eventId = resolveDefaultId(list)!;
    setSelectedEventId(eventId);
    await loadAttendeesFor(eventId);
    setLoading(false);
  }, [canSweep, fetchEvents, healOrphans, loadAttendeesFor, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const createEvent = async (eventDate: string) => {
    if (events.length >= MAX_EVENTS) {
      throw new Error(`Só é possível ter ${MAX_EVENTS} cafés ao mesmo tempo — encerre um antes de criar outro.`);
    }
    const newId = await insertCoffeeEvent(eventDate);
    await fetchEvents();
    await selectEvent(newId);
  };

  const updateEvent = async (eventDate: string) => {
    if (!selectedEventId) return;
    await updateCoffeeEventDate(selectedEventId, eventDate);
    await fetchEvents();
    await loadAttendeesFor(selectedEventId);
  };

  const deleteSelectedEvent = async () => {
    if (!selectedEventId) return;
    const { error: deleteError } = await supabase.from('coffee_events').delete().eq('id', selectedEventId);
    if (deleteError) throw deleteError;
    await load();
  };

  const enrollPerson = async (person: EnrollableCoffeePerson) => {
    if (!selectedEventId) return;
    await enrollInCoffee(person.id, selectedEventId);
    await loadAttendeesFor(selectedEventId);
  };

  // These three patch `attendees` in place instead of re-running `load()` —
  // re-fetching would flip `loading` back to true and flash/replace the
  // whole table for a change that only ever affects a single row.
  const markAttended = async (attendanceId: string, personId: string) => {
    await markCoffeeAttended(attendanceId, personId, user?.id);
    setAllAttendees((prev) =>
      prev.map((a) =>
        a.id === attendanceId ? { ...a, attended: true, person: { ...a.person, status: 'pending_signup' } } : a,
      ),
    );
  };

  const markNotAttended = async (personId: string) => {
    await markCoffeeNotAttended(personId, user?.id);
    setAllAttendees((prev) => prev.filter((a) => a.person.id !== personId));
  };

  const markCanceled = async (personId: string) => {
    await markCoffeeCanceled(personId, user?.id);
    setAllAttendees((prev) => prev.filter((a) => a.person.id !== personId));
  };

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };

  const event = events.find((e) => e.id === selectedEventId) ?? null;

  const filtered = debouncedSearch
    ? allAttendees.filter((a) => a.person.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : allAttendees;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const attendees = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return {
    events,
    canCreateEvent: events.length < MAX_EVENTS,
    event,
    selectedEventId,
    selectEvent,
    attendees,
    totalCount: filtered.length,
    loading,
    error,
    page: clampedPage,
    totalPages,
    setPage,
    search,
    setSearch,
    hasFilter: !!search.trim(),
    createEvent,
    updateEvent,
    deleteSelectedEvent,
    enrollPerson,
    markAttended,
    markNotAttended,
    markCanceled,
  };
}
