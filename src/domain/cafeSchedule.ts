// Local
import { STATUS_META } from '../types/person';

export interface CoffeeEventRef {
  id: string;
  event_date: string;
}

export function upcomingCoffeeEvent<T extends CoffeeEventRef>(events: T[], today: string): T | null {
  return events.find((e) => e.event_date >= today) ?? null;
}

export function selectOpenCoffeeEvents<T extends CoffeeEventRef>(
  events: T[],
  queuedByEventId: Record<string, number>,
  todayKey: string,
): T[] {
  return events.filter((e) => e.event_date >= todayKey || (queuedByEventId[e.id] ?? 0) > 0);
}

export function canMarkCoffeeAttendance(eventDate: string, today: string): boolean {
  return eventDate <= today;
}

export interface PersonCoffeeAttendance {
  id: string;
  attended: boolean;
  eventDate: string;
}

export interface EnrollableCoffeePerson {
  id: string;
  name: string;
}

export type CoffeePresence = 'came' | 'missed' | null;

export const STATUS_AFTER_PRESENCE: Record<'came' | 'missed' | 'none', string> = {
  came: 'pending_signup',
  missed: 'retry_contact',
  none: 'welcome_coffee',
};

export function isReturningToSignup(person: { status: string; signup_window_from?: string | null } | null): boolean {
  return person?.status === 'pending_signup' && !!person.signup_window_from;
}

export const COFFEE_LIST_STATUSES = ['welcome_coffee', 'pending_signup', 'retry_contact'];

export function isSeatedInUpcomingCoffee(
  person: { status: string; signup_window_from?: string | null } | null,
): boolean {
  return COFFEE_LIST_STATUSES.includes(person?.status ?? '') && !isReturningToSignup(person);
}

export function isListedInCoffee(person: { status: string } | null, eventDate: string, today: string): boolean {
  const status = person?.status ?? '';
  return COFFEE_LIST_STATUSES.includes(status) && (status !== 'retry_contact' || eventDate <= today);
}

export function coffeePresence(
  row: { attended: boolean; person: { status: string } | null; coffee_event: { event_date: string } | null },
  latestEventDate: string | undefined,
): { presence: CoffeePresence; editable: boolean } {
  const isLatest = (row.coffee_event?.event_date ?? '') >= (latestEventDate ?? '');
  const status = row.person?.status ?? '';
  const editable = isLatest && COFFEE_LIST_STATUSES.includes(status);
  if (row.attended) return { presence: 'came', editable };
  if (!isLatest || status === 'retry_contact') return { presence: 'missed', editable };
  return { presence: null, editable };
}

export function latestCoffeeDateByPerson(
  attendance: Pick<CoffeeBoardAttendance, 'person_id' | 'coffee_event'>[],
): Map<string, string> {
  const latest = new Map<string, string>();
  for (const row of attendance) {
    const date = row.coffee_event?.event_date ?? '';
    if (date > (latest.get(row.person_id) ?? '')) latest.set(row.person_id, date);
  }
  return latest;
}

export interface CoffeeBoardAttendance {
  id: string;
  person_id: string;
  coffee_event_id: string;
  attended: boolean;
  person: {
    id: string;
    name: string;
    phone: string;
    status: string;
    class_invite_sent_at: string | null;
    signup_window_from?: string | null;
  } | null;
  coffee_event: { event_date: string } | null;
}

export interface CoffeeBoard {
  events: { id: string; event_date: string; event_time: string }[];
  attendance: CoffeeBoardAttendance[];
}

export function countQueuedFrom(attendance: CoffeeBoardAttendance[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of attendance) {
    if (row.person?.status !== 'welcome_coffee' && row.person?.status !== 'pending_signup') continue;
    if (isReturningToSignup(row.person)) continue;
    counts[row.coffee_event_id] = (counts[row.coffee_event_id] ?? 0) + 1;
  }
  return counts;
}

export function currentCoffeeAttendance<T extends Pick<CoffeeBoardAttendance, 'person_id' | 'coffee_event'>>(
  attendance: T[],
): T[] {
  const latest = new Map<string, T>();
  for (const row of attendance) {
    const current = latest.get(row.person_id);
    if (!current || (row.coffee_event?.event_date ?? '') > (current.coffee_event?.event_date ?? '')) {
      latest.set(row.person_id, row);
    }
  }
  return [...latest.values()];
}

export type CoffeeHistoryPresence =
  'came' | 'missed' | 'archived' | 'unmarked' | 'enrolled' | 'invited' | 'awaiting_contact';

export const COFFEE_HISTORY_PRESENCE_LABELS: Record<CoffeeHistoryPresence, string> = {
  came: 'Veio',
  missed: 'Faltou',
  archived: 'Arquivado',
  unmarked: 'Não marcado',
  enrolled: 'Inscrito',
  invited: 'Convite enviado',
  awaiting_contact: STATUS_META.retry_contact.label,
};

interface CoffeeHistoryPerson {
  personId: string;
  name: string;
  presence: CoffeeHistoryPresence;
}

function historyPresence(
  row: CoffeeBoardAttendance,
  latestEventDate: string | undefined,
  today: string,
): CoffeeHistoryPresence {
  const presence = coffeePresence(row, latestEventDate).presence;
  if (presence) return presence;
  if (row.person?.status === 'archived') return 'archived';
  return (row.coffee_event?.event_date ?? '') < today ? 'unmarked' : 'enrolled';
}

function futurePresence(person: { status: string } | null): CoffeeHistoryPresence {
  return person?.status === 'retry_contact' ? 'awaiting_contact' : 'enrolled';
}

interface CoffeeHistoryEvent {
  id: string;
  eventDate: string;
  people: CoffeeHistoryPerson[];
}

export function coffeeHistory(board: Pick<CoffeeBoard, 'events' | 'attendance'>, today: string): CoffeeHistoryEvent[] {
  const latest = latestCoffeeDateByPerson(board.attendance);
  const current = currentCoffeeAttendance(board.attendance);
  const upcomingId = upcomingCoffeeEvent(
    [...board.events].sort((a, b) => a.event_date.localeCompare(b.event_date)),
    today,
  )?.id;
  const invited = current
    .filter((row) => isReturningToSignup(row.person))
    .map((row) => ({ personId: row.person_id, name: row.person?.name ?? '', presence: 'invited' as const }));

  return [...board.events]
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
    .map((event) => {
      const isFuture = event.event_date >= today;
      const seated = board.attendance
        .filter((row) => row.coffee_event_id === event.id && row.person)
        .filter((row) => !isFuture || isSeatedInUpcomingCoffee(row.person))
        .map((row) => ({
          personId: row.person_id,
          name: row.person?.name ?? '',
          presence:
            isFuture && !row.attended
              ? futurePresence(row.person)
              : historyPresence(row, latest.get(row.person_id), today),
        }));
      return {
        id: event.id,
        eventDate: event.event_date,
        people: [...seated, ...(event.id === upcomingId ? invited : [])].sort((a, b) =>
          a.name.localeCompare(b.name, 'pt-BR'),
        ),
      };
    });
}
