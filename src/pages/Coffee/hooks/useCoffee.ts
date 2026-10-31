// React
import { useCallback, useEffect, useRef, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  COFFEE_LIST_STATUSES,
  CoffeeBoard,
  CoffeePresence,
  STATUS_AFTER_PRESENCE,
  EnrollableCoffeePerson,
  attachPeopleToCoffee,
  coffeePresence,
  countQueuedFrom,
  currentCoffeeAttendance,
  placeInCoffee,
  fetchCoffeeBoard,
  insertCoffeeEvent,
  latestCoffeeDateByPerson,
  markCoffeeAttended,
  markCoffeeAttendedAfterMiss,
  markCoffeeCanceled,
  markCoffeeNotAttended,
  selectOpenCoffeeEvents,
  selectOrphanPeople,
  unmarkCoffeePresence,
  updateCoffeeEventDate,
} from '../../../domain/cafeSchedule';
import { listAllCohorts } from '../../../domain/classesRoster';
import { archivePeople, missedSignupIds } from '../../../domain/signupDeadline';
import { supabase } from '../../../lib/supabase';
import { UserRole } from '../../../types/enums';
import { todayKey } from '../../../domain/dates';
import { comparePeopleByPipeline } from '../../../types/person';
import { AttendeeRow, CoffeeEvent } from '../types';

const PAGE_SIZE = 10;
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
  const boardRef = useRef<CoffeeBoard | null>(null);

  const applyBoard = useCallback(
    (board: CoffeeBoard, keepSelectionId?: string) => {
      boardRef.current = board;
      const current = currentCoffeeAttendance(board.attendance);
      const open = selectOpenCoffeeEvents(
        board.events as CoffeeEvent[],
        countQueuedFrom(current),
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
      const latest = latestCoffeeDateByPerson(board.attendance);
      setAllAttendees(
        current
          .filter((a) => a.coffee_event_id === selected.id && COFFEE_LIST_STATUSES.includes(a.person?.status ?? ''))
          .filter((a) => a.person?.status !== 'retry_contact' || selected.event_date <= todayKey())
          .map((a) => {
            const { presence, editable } = coffeePresence(a, latest.get(a.person_id));
            return { ...a, presence, presenceEditable: editable } as unknown as AttendeeRow;
          })
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
    await placeInCoffee(person.id, selectedEventId);
    await load(selectedEventId);
  };

  const changePresence = async (
    attendanceId: string,
    personId: string,
    from: CoffeePresence,
    to: CoffeePresence,
  ) => {
    const personStatus = STATUS_AFTER_PRESENCE[from ?? 'none'];
    if (to === 'came') {
      if (from === 'missed') await markCoffeeAttendedAfterMiss(attendanceId, personId, user?.id);
      else await markCoffeeAttended(attendanceId, personId, user?.id);
    } else if (to === 'missed') {
      await markCoffeeNotAttended(personId, user?.id, attendanceId, personStatus);
    } else {
      await unmarkCoffeePresence(attendanceId, personId, personStatus, user?.id);
    }
    await load(selectedEventId ?? undefined);
  };

  const setPresence = async (row: AttendeeRow, presence: 'came' | 'missed') => {
    if (presence === row.presence) return;
    await changePresence(row.id, row.person.id, row.presence, presence);
  };

  const undoPresence = (row: AttendeeRow, applied: 'came' | 'missed') =>
    changePresence(row.id, row.person.id, applied, row.presence);

  const markCanceled = async (personId: string) => {
    await markCoffeeCanceled(personId, user?.id);
    setAllAttendees((prev) => prev.filter((a) => a.person.id !== personId));
  };

  const event = events.find((e) => e.id === selectedEventId) ?? null;

  const totalPages = Math.max(1, Math.ceil(allAttendees.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const attendees = allAttendees.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return {
    events,
    canCreateEvent: events.length < MAX_EVENTS,
    event,
    selectedEventId,
    selectEvent: (eventId: string) => (boardRef.current ? applyBoard(boardRef.current, eventId) : load(eventId)),
    attendees,
    totalCount: allAttendees.length,
    loading,
    error,
    page: clampedPage,
    totalPages,
    setPage,
    createEvent,
    updateEvent,
    deleteSelectedEvent,
    enrollPerson,
    setPresence,
    undoPresence,
    markCanceled,
  };
}
