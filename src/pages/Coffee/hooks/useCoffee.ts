// React
import { useCallback, useEffect, useRef, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  CoffeeBoard,
  EnrollableCoffeePerson,
  attachPeopleToCoffee,
  countQueuedFrom,
  enrollInCoffee,
  fetchCoffeeBoard,
  insertCoffeeEvent,
  markCoffeeAttended,
  markCoffeeCanceled,
  markCoffeeNotAttended,
  selectOpenCoffeeEvents,
  selectOrphanPeople,
  updateCoffeeEventDate,
} from '../../../domain/cafeSchedule';
import { listAllCohorts } from '../../../domain/classesRoster';
import { archivePeople, missedSignupIds } from '../../../domain/signupDeadline';
import { supabase } from '../../../lib/supabase';
import { UserRole } from '../../../types/enums';
import { comparePeopleByPipeline } from '../../../types/person';
import { loadSavedFilters, saveFilters } from '../persistence';
import { AttendeeRow, CoffeeEvent } from '../types';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const MAX_EVENTS = 2;

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
  const boardRef = useRef<CoffeeBoard | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    saveFilters({ search });
  }, [search]);

  const applyBoard = useCallback(
    (board: CoffeeBoard, keepSelectionId?: string) => {
      boardRef.current = board;
      const open = selectOpenCoffeeEvents(
        board.events as CoffeeEvent[],
        countQueuedFrom(board.attendance),
        new Date().toISOString().slice(0, 10),
      );
      setEvents(open);

      if (open.length === 0) {
        setSelectedEventId(null);
        setAllAttendees([]);
        return null;
      }

      const selected = open.find((e) => e.id === keepSelectionId) ?? open[0];
      setSelectedEventId(selected.id);
      setAllAttendees(
        board.attendance
          .filter((a) => a.coffee_event_id === selected.id)
          .filter((a) => a.person?.status === 'welcome_coffee' || a.person?.status === 'pending_signup')
          .map((a) => a as unknown as AttendeeRow)
          .sort((a, b) => comparePeopleByPipeline(a.person, b.person)),
      );
      setPage(1);
      return selected.id;
    },
    [],
  );

  const load = useCallback(
    async (keepSelectionId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const [board, cohorts] = await Promise.all([fetchCoffeeBoard(), listAllCohorts()]);

        let healed = false;
        if (canSweep) {
          const archived = await archivePeople(missedSignupIds(board.people, board.attendance, cohorts), user?.id);

          const todayKey = new Date().toISOString().slice(0, 10);
          const upcomingId = board.events.find((e) => e.event_date >= todayKey)?.id;
          const orphans = upcomingId ? selectOrphanPeople(board.people, board.attendance) : [];
          if (orphans.length > 0 && upcomingId) await attachPeopleToCoffee(orphans, upcomingId);

          healed = archived > 0 || orphans.length > 0;
        }

        if (healed) {
          applyBoard(await fetchCoffeeBoard(), keepSelectionId);
        } else {
          applyBoard(board, keepSelectionId);
        }
      } catch (loadError) {
        setError((loadError as Error).message);
      }

      setLoading(false);
    },
    [applyBoard, canSweep, user?.id],
  );

  useEffect(() => {
    load();
  }, [load]);

  const createEvent = async (eventDate: string) => {
    if (events.length >= MAX_EVENTS) {
      throw new Error(`Só é possível ter ${MAX_EVENTS} cafés ao mesmo tempo — encerre um antes de criar outro.`);
    }
    const newId = await insertCoffeeEvent(eventDate);
    await load(newId);
  };

  const updateEvent = async (eventDate: string) => {
    if (!selectedEventId) return;
    await updateCoffeeEventDate(selectedEventId, eventDate);
    await load(selectedEventId);
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
    await load(selectedEventId);
  };

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
    selectEvent: (eventId: string) => (boardRef.current ? applyBoard(boardRef.current, eventId) : load(eventId)),
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
