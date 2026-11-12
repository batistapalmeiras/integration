// React
import { useMemo } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import {
  CoffeeBoard,
  CoffeeBoardAttendance,
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
import { datePathFilter } from '../../../lib/pathFilters';
import { useListParams } from '../../../lib/useListParams';
import { AppRoute } from '../../../routes/paths';
import { todayKey } from '../../../domain/dates';
import { comparePeopleByPipeline, toPersonStatus } from '../../../types/person';
import { AttendeeRow, CoffeeEvent } from '../types';

const MAX_EVENTS = 2;

type AttendeeState = Pick<AttendeeRow, 'coffee_event_id' | 'presence' | 'presenceEditable' | 'returning'>;

function toAttendee(row: CoffeeBoardAttendance, state: AttendeeState): AttendeeRow[] {
  if (!row.person) return [];
  const { id, person_id, attended } = row;
  return [{ id, person_id, attended, ...state, person: { ...row.person, status: toPersonStatus(row.person.status) } }];
}

function buildAttendees(board: CoffeeBoard, selected: CoffeeEvent, open: CoffeeEvent[]): AttendeeRow[] {
  const current = currentCoffeeAttendance(board.attendance);
  const latest = latestCoffeeDateByPerson(board.attendance);
  const isUpcoming = selected.id === upcomingCoffeeEvent(open, todayKey())?.id;
  const seated = current
    .filter((a) => a.coffee_event_id === selected.id && !isReturningToSignup(a.person))
    .filter((a) => isListedInCoffee(a.person, selected.event_date, todayKey()))
    .flatMap((a) => {
      const { presence, editable } = coffeePresence(a, latest.get(a.person_id));
      return toAttendee(a, {
        coffee_event_id: a.coffee_event_id,
        presence,
        presenceEditable: editable,
        returning: false,
      });
    });
  const returning = isUpcoming
    ? current
        .filter((a) => isReturningToSignup(a.person))
        .flatMap((a) =>
          toAttendee(a, { coffee_event_id: selected.id, presence: null, presenceEditable: false, returning: true }),
        )
    : [];
  return [...seated, ...returning].sort((a, b) => comparePeopleByPipeline(a.person, b.person));
}

const FILTERS = [datePathFilter('cafe')];

export function useCoffee() {
  const { user } = useAuthCtx();
  const list = useListParams({ basePath: AppRoute.Coffee, filters: FILTERS });
  const selectedDate = list.filter('cafe')[0] ?? null;
  const boardQuery = useQuery(queryKeys.coffeeBoard, fetchCoffeeBoard);
  const board = boardQuery.data;

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

  const event = events.find((e) => e.event_date === selectedDate) ?? events.at(-1) ?? null;
  const selectedEventId = event?.id ?? null;

  const allAttendees = useMemo(
    () => (board && event ? buildAttendees(board, event, events) : []),
    [board, event, events],
  );

  const selectDate = (eventDate: string | null) => list.setFilter('cafe', eventDate ? [eventDate] : []);

  const createEvent = async (eventDate: string) => {
    if (events.length >= MAX_EVENTS) {
      throw new Error(`Só é possível ter ${MAX_EVENTS} cafés ao mesmo tempo — encerre um antes de criar outro.`);
    }
    await insertCoffeeEvent(eventDate);
    selectDate(eventDate);
    await refreshAfterEventChange();
  };

  const updateEvent = async (eventDate: string) => {
    if (!selectedEventId) return;
    await updateCoffeeEventDate(selectedEventId, eventDate);
    selectDate(eventDate);
    await refreshAfterEventChange();
  };

  const deleteSelectedEvent = async () => {
    if (!selectedEventId) return;
    await deleteCoffeeEvent(selectedEventId);
    selectDate(null);
    await refreshAfterEventChange();
  };

  const enrollPerson = async (person: EnrollableCoffeePerson) => {
    if (!selectedEventId) return;
    await placeInCoffee(person.id, selectedEventId);
    list.setPage(1);
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
    list.setPage(1);
    await refreshBoard();
  };

  const setPresence = async (row: AttendeeRow, presence: 'came' | 'missed') => {
    if (presence === row.presence) return;
    await changePresence(row.id, row.person.id, row.presence, presence);
  };

  const undoPresence = (row: AttendeeRow, applied: 'came' | 'missed') =>
    changePresence(row.id, row.person.id, applied, row.presence);

  const clearPresence = (row: AttendeeRow) => changePresence(row.id, row.person.id, row.presence, null);

  const markCanceled = async (personId: string) => {
    await markCoffeeCanceled(personId, user?.id);
    setQueryData<CoffeeBoard>(queryKeys.coffeeBoard, (current) => ({
      ...(current as CoffeeBoard),
      attendance: (current as CoffeeBoard).attendance.map((row) =>
        row.person_id === personId && row.person ? { ...row, person: { ...row.person, status: 'archived' } } : row,
      ),
    }));
  };

  const { items: attendees, page, totalPages } = list.paginate(allAttendees);

  return {
    events,
    canCreateEvent: events.length < MAX_EVENTS,
    event,
    selectedEventId,
    selectEvent: (eventId: string) => selectDate(events.find((e) => e.id === eventId)?.event_date ?? null),
    attendees,
    totalCount: allAttendees.length,
    loading: boardQuery.loading,
    error: errorMessage(boardQuery.error),
    page,
    totalPages,
    setPage: list.setPage,
    createEvent,
    updateEvent,
    deleteSelectedEvent,
    enrollPerson,
    setPresence,
    undoPresence,
    clearPresence,
    markCanceled,
  };
}
