// React
import { useMemo, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  CoffeeBoard,
  CoffeePresence,
  coffeePresence,
  countQueuedFrom,
  currentCoffeeAttendance,
  EnrollableCoffeePerson,
  isListedInCoffee,
  isReturningToSignup,
  latestCoffeeDateByPerson,
  selectOpenCoffeeEvents,
  STATUS_AFTER_PRESENCE,
  upcomingCoffeeEvent,
} from '../../../domain/cafeSchedule';
import {
  deleteCoffeeEvent,
  fetchCoffeeBoard,
  insertCoffeeEvent,
  markCoffeeAttended,
  markCoffeeAttendedAfterMiss,
  markCoffeeCanceled,
  markCoffeeNotAttended,
  placeInCoffee,
  unmarkCoffeePresence,
  updateCoffeeEventDate,
} from '../../../repositories/cafeSchedule';
import { runPipelineMaintenance } from '../../../repositories/integrationPeople';
import { errorMessage, fetchQuery, setQueryData, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { todayKey } from '../../../domain/dates';
import { comparePeopleByPipeline } from '../../../types/person';
import { AttendeeRow, CoffeeEvent } from '../types';

const PAGE_SIZE = 10;
const MAX_EVENTS = 2;

function buildAttendees(board: CoffeeBoard, selected: CoffeeEvent, open: CoffeeEvent[]): AttendeeRow[] {
  const current = currentCoffeeAttendance(board.attendance);
  const latest = latestCoffeeDateByPerson(board.attendance);
  const isUpcoming = selected.id === upcomingCoffeeEvent(open, todayKey())?.id;
  const seated = current
    .filter((a) => a.coffee_event_id === selected.id && !isReturningToSignup(a.person))
    .filter((a) => isListedInCoffee(a.person, selected.event_date, todayKey()))
    .map((a) => {
      const { presence, editable } = coffeePresence(a, latest.get(a.person_id));
      return { ...a, presence, presenceEditable: editable, returning: false } as unknown as AttendeeRow;
    });
  const returning = isUpcoming
    ? current
        .filter((a) => isReturningToSignup(a.person))
        .map(
          (a) =>
            ({
              ...a,
              coffee_event_id: selected.id,
              presence: null,
              presenceEditable: false,
              returning: true,
            }) as unknown as AttendeeRow,
        )
    : [];
  return [...seated, ...returning].sort((a, b) => comparePeopleByPipeline(a.person, b.person));
}

export function useCoffee() {
  const { user } = useAuthCtx();
  const boardQuery = useQuery(queryKeys.coffeeBoard, fetchCoffeeBoard);
  const board = boardQuery.data;
  const [selectedEventIdState, setSelectedEventIdState] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const refreshBoard = () => fetchQuery(queryKeys.coffeeBoard, fetchCoffeeBoard);

  const refreshAfterEventChange = async () => {
    await runPipelineMaintenance();
    await refreshBoard();
  };

  const events = useMemo(() => {
    if (!board) return [];
    const current = currentCoffeeAttendance(board.attendance);
    return selectOpenCoffeeEvents(board.events as CoffeeEvent[], countQueuedFrom(current), todayKey());
  }, [board]);

  const event = events.find((e) => e.id === selectedEventIdState) ?? events[0] ?? null;
  const selectedEventId = event?.id ?? null;

  const allAttendees = useMemo(
    () => (board && event ? buildAttendees(board, event, events) : []),
    [board, event, events],
  );

  const selectEvent = (eventId: string | null) => {
    setSelectedEventIdState(eventId);
    setPage(1);
  };

  const createEvent = async (eventDate: string) => {
    if (events.length >= MAX_EVENTS) {
      throw new Error(`Só é possível ter ${MAX_EVENTS} cafés ao mesmo tempo — encerre um antes de criar outro.`);
    }
    const newId = await insertCoffeeEvent(eventDate);
    selectEvent(newId);
    await refreshAfterEventChange();
  };

  const updateEvent = async (eventDate: string) => {
    if (!selectedEventId) return;
    await updateCoffeeEventDate(selectedEventId, eventDate);
    setPage(1);
    await refreshAfterEventChange();
  };

  const deleteSelectedEvent = async () => {
    if (!selectedEventId) return;
    await deleteCoffeeEvent(selectedEventId);
    selectEvent(null);
    await refreshAfterEventChange();
  };

  const enrollPerson = async (person: EnrollableCoffeePerson) => {
    if (!selectedEventId) return;
    await placeInCoffee(person.id, selectedEventId);
    setPage(1);
    await refreshBoard();
  };

  const changePresence = async (attendanceId: string, personId: string, from: CoffeePresence, to: CoffeePresence) => {
    const personStatus = STATUS_AFTER_PRESENCE[from ?? 'none'];
    if (to === 'came') {
      if (from === 'missed') await markCoffeeAttendedAfterMiss(attendanceId, personId, user?.id);
      else await markCoffeeAttended(attendanceId, personId, user?.id);
    } else if (to === 'missed') {
      await markCoffeeNotAttended(personId, user?.id, attendanceId, personStatus);
    } else {
      await unmarkCoffeePresence(attendanceId, personId, personStatus, user?.id);
    }
    setPage(1);
    await refreshBoard();
  };

  const setPresence = async (row: AttendeeRow, presence: 'came' | 'missed') => {
    if (presence === row.presence) return;
    await changePresence(row.id, row.person.id, row.presence, presence);
  };

  const undoPresence = (row: AttendeeRow, applied: 'came' | 'missed') =>
    changePresence(row.id, row.person.id, applied, row.presence);

  const markCanceled = async (personId: string) => {
    await markCoffeeCanceled(personId, user?.id);
    setQueryData<CoffeeBoard>(queryKeys.coffeeBoard, (current) => ({
      ...(current as CoffeeBoard),
      attendance: (current as CoffeeBoard).attendance.map((row) =>
        row.person_id === personId && row.person ? { ...row, person: { ...row.person, status: 'archived' } } : row,
      ),
    }));
  };

  const totalPages = Math.max(1, Math.ceil(allAttendees.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const attendees = allAttendees.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return {
    events,
    canCreateEvent: events.length < MAX_EVENTS,
    event,
    selectedEventId,
    selectEvent: (eventId: string) => selectEvent(eventId),
    attendees,
    totalCount: allAttendees.length,
    loading: boardQuery.loading,
    error: errorMessage(boardQuery.error),
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
