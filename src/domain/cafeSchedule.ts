// Libs
import { supabase } from '../lib/supabase';

async function findFutureCoffeeEvent(): Promise<{ id: string; event_date: string } | null> {
  const todayKey = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('coffee_events')
    .select('id, event_date')
    .gte('event_date', todayKey)
    .order('event_date', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface CoffeeEventRef {
  id: string;
  event_date: string;
}

export function selectOpenCoffeeEvents<T extends CoffeeEventRef>(
  events: T[],
  queuedByEventId: Record<string, number>,
  todayKey: string,
): T[] {
  return events.filter((e) => e.event_date >= todayKey || (queuedByEventId[e.id] ?? 0) > 0);
}

export async function countQueuedByCoffeeEvent(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('coffee_attendance').select('coffee_event_id, person:people(status)');
  if (error) throw error;

  const rows = (data ?? []) as unknown as { coffee_event_id: string; person: { status: string } | null }[];
  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (row.person?.status !== 'welcome_coffee' && row.person?.status !== 'pending_signup') continue;
    counts[row.coffee_event_id] = (counts[row.coffee_event_id] ?? 0) + 1;
  }
  return counts;
}

export async function insertCoffeeEvent(eventDate: string): Promise<string> {
  const { data, error } = await supabase.from('coffee_events').insert({ event_date: eventDate }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function updateCoffeeEventDate(id: string, eventDate: string): Promise<void> {
  const { error } = await supabase.from('coffee_events').update({ event_date: eventDate }).eq('id', id);
  if (error) throw error;
}

export async function hasUpcomingCoffeeEvent(): Promise<boolean> {
  const future = await findFutureCoffeeEvent();
  return !!future;
}

export async function getUpcomingCoffeeEventDate(): Promise<string | null> {
  const future = await findFutureCoffeeEvent();
  return future?.event_date ?? null;
}

export async function getPersonAttendedCoffeeDate(personId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('coffee_attendance')
    .select('coffee_event:coffee_events(event_date)')
    .eq('person_id', personId)
    .eq('attended', true);
  if (error) throw error;

  const rows = (data ?? []) as unknown as { coffee_event: { event_date: string } }[];
  if (rows.length === 0) return null;
  return rows.map((r) => r.coffee_event.event_date).sort().at(-1) ?? null;
}

export async function placeInCoffee(personId: string, eventId: string): Promise<string> {
  const { data, error } = await supabase.rpc('place_in_coffee', { p_person_id: personId, p_coffee_event_id: eventId });
  if (error) throw error;
  return data as string;
}

export async function attachToNextWelcomeCoffee(personId: string): Promise<void> {
  const future = await findFutureCoffeeEvent();
  if (!future) throw new Error('Nenhum café de boas-vindas agendado.');
  await placeInCoffee(personId, future.id);
}

export function canMarkCoffeeAttendance(eventDate: string, today: string): boolean {
  return eventDate <= today;
}

export async function resolveCurrentCoffeeEventId(): Promise<string | null> {
  const { data: events, error } = await supabase
    .from('coffee_events')
    .select('id, event_date')
    .order('event_date', { ascending: true });
  if (error) throw error;

  const todayKey = new Date().toISOString().slice(0, 10);
  const list = events ?? [];
  const current = list.find((e) => e.event_date >= todayKey) ?? list[list.length - 1] ?? null;
  return current?.id ?? null;
}

export interface PersonCoffeeAttendance {
  id: string;
  attended: boolean;
  eventDate: string;
}

async function fetchCurrentCoffeeAttendance(personId: string): Promise<PersonCoffeeAttendance | null> {
  const { data, error } = await supabase
    .from('coffee_attendance')
    .select('id, attended, person_id, coffee_event:coffee_events(event_date)')
    .eq('person_id', personId);
  if (error) throw error;

  const rows = (data ?? []) as unknown as {
    id: string;
    attended: boolean;
    person_id: string;
    coffee_event: { event_date: string } | null;
  }[];
  const [current] = currentCoffeeAttendance(rows);
  return current ? { id: current.id, attended: current.attended, eventDate: current.coffee_event?.event_date ?? '' } : null;
}

export async function getCoffeeAttendanceForPerson(personId: string): Promise<PersonCoffeeAttendance | null> {
  const existing = await fetchCurrentCoffeeAttendance(personId);
  if (existing) return existing;

  const eventId = await resolveCurrentCoffeeEventId();
  if (!eventId) return null;

  await placeInCoffee(personId, eventId);
  return fetchCurrentCoffeeAttendance(personId);
}

export interface EnrollableCoffeePerson {
  id: string;
  name: string;
}

export async function listEnrollableCoffeePeople(eventId: string): Promise<EnrollableCoffeePerson[]> {
  const { data: attending, error: attendingError } = await supabase
    .from('coffee_attendance')
    .select('person_id')
    .eq('coffee_event_id', eventId);
  if (attendingError) throw attendingError;
  const attendingIds = new Set((attending ?? []).map((a) => a.person_id as string));

  const { data, error } = await supabase
    .from('people')
    .select('id, name')
    .not('status', 'in', '(archived,welcome_coffee)')
    .order('name');
  if (error) throw error;
  return (data ?? []).filter((p) => !attendingIds.has(p.id as string)) as EnrollableCoffeePerson[];
}

export async function markCoffeeAttended(attendanceId: string, personId: string, actorId?: string): Promise<void> {
  const { error } = await supabase.rpc('mark_coffee_attended', {
    p_attendance_id: attendanceId,
    p_person_id: personId,
    p_actor_id: actorId ?? null,
  });
  if (error) throw error;
}

export async function markCoffeeCanceled(personId: string, actorId?: string): Promise<void> {
  const { error: statusError } = await supabase
    .from('people')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', personId);
  if (statusError) throw statusError;

  await supabase.from('status_history').insert({
    person_id: personId,
    from_status: 'welcome_coffee',
    to_status: 'archived',
    changed_by: actorId,
    note: 'Cancelou a presença no café antes da data',
  });
}

export async function markCoffeeNotAttended(
  personId: string,
  actorId?: string,
  attendanceId?: string,
  fromStatus = 'welcome_coffee',
): Promise<void> {
  if (attendanceId) {
    const { error: attendanceError } = await supabase
      .from('coffee_attendance')
      .update({ attended: false })
      .eq('id', attendanceId);
    if (attendanceError) throw attendanceError;
  }

  const { error: statusError } = await supabase
    .from('people')
    .update({ status: 'retry_contact', coffee_retry_used: true, whatsapp_opened_at: null, updated_at: new Date().toISOString() })
    .eq('id', personId);
  if (statusError) throw statusError;

  await supabase.from('status_history').insert({
    person_id: personId,
    from_status: fromStatus,
    to_status: 'retry_contact',
    changed_by: actorId,
    note: 'Confirmou presença mas não compareceu ao café — retomando contato para o próximo café',
  });
}

export async function markCoffeeAttendedAfterMiss(
  attendanceId: string,
  personId: string,
  actorId?: string,
): Promise<void> {
  const { error } = await supabase
    .from('people')
    .update({ status: 'welcome_coffee', coffee_retry_used: false, updated_at: new Date().toISOString() })
    .eq('id', personId);
  if (error) throw error;

  try {
    await markCoffeeAttended(attendanceId, personId, actorId);
  } catch (attendedError) {
    await supabase
      .from('people')
      .update({ status: 'retry_contact', coffee_retry_used: true, updated_at: new Date().toISOString() })
      .eq('id', personId);
    throw attendedError;
  }
}

export async function unmarkCoffeePresence(
  attendanceId: string,
  personId: string,
  fromStatus: string,
  actorId?: string,
): Promise<void> {
  const { error: attendanceError } = await supabase
    .from('coffee_attendance')
    .update({ attended: false })
    .eq('id', attendanceId);
  if (attendanceError) throw attendanceError;

  const { error: statusError } = await supabase
    .from('people')
    .update({ status: 'welcome_coffee', coffee_retry_used: false, updated_at: new Date().toISOString() })
    .eq('id', personId);
  if (statusError) throw statusError;

  await supabase.from('status_history').insert({
    person_id: personId,
    from_status: fromStatus,
    to_status: 'welcome_coffee',
    changed_by: actorId,
    note: 'Marcação de presença no café desfeita',
  });
}

export type CoffeePresence = 'came' | 'missed' | null;

export const STATUS_AFTER_PRESENCE: Record<'came' | 'missed' | 'none', string> = {
  came: 'pending_signup',
  missed: 'retry_contact',
  none: 'welcome_coffee',
};

export const COFFEE_LIST_STATUSES = ['welcome_coffee', 'pending_signup', 'retry_contact'];

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

export async function markClassInviteNoResponse(personId: string, actorId?: string): Promise<void> {
  const { error } = await supabase.from('contact_attempts').insert({
    person_id: personId,
    channel: 'text',
    result: 'no_response',
    made_by: actorId,
  });
  if (error) throw error;
}

export async function markClassInviteDeclined(personId: string, actorId?: string): Promise<void> {
  const { error: attemptError } = await supabase.from('contact_attempts').insert({
    person_id: personId,
    channel: 'text',
    result: 'declined',
    made_by: actorId,
  });
  if (attemptError) throw attemptError;

  const { error: statusError } = await supabase
    .from('people')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', personId);
  if (statusError) throw statusError;

  await supabase.from('status_history').insert({
    person_id: personId,
    from_status: 'pending_signup',
    to_status: 'archived',
    changed_by: actorId,
    note: 'Recusou o convite para as aulas de Integração',
  });
}

export interface CoffeeBoardAttendance {
  id: string;
  person_id: string;
  coffee_event_id: string;
  attended: boolean;
  person: { id: string; name: string; phone: string; status: string; class_invite_sent_at: string | null } | null;
  coffee_event: { event_date: string } | null;
}

export interface CoffeeBoardPerson {
  id: string;
  status: string;
}

export interface CoffeeBoard {
  events: { id: string; event_date: string; event_time: string }[];
  attendance: CoffeeBoardAttendance[];
  people: CoffeeBoardPerson[];
}

export async function fetchCoffeeBoard(): Promise<CoffeeBoard> {
  const [events, attendance, people] = await Promise.all([
    supabase.from('coffee_events').select('*').order('event_date', { ascending: true }),
    supabase
      .from('coffee_attendance')
      .select('*, person:people(id,name,phone,status,class_invite_sent_at), coffee_event:coffee_events(event_date)'),
    supabase.from('people').select('id, status').in('status', ['welcome_coffee', 'pending_signup']),
  ]);

  const failure = events.error ?? attendance.error ?? people.error;
  if (failure) throw failure;

  return {
    events: (events.data ?? []) as CoffeeBoard['events'],
    attendance: (attendance.data ?? []) as unknown as CoffeeBoardAttendance[],
    people: (people.data ?? []) as CoffeeBoardPerson[],
  };
}

export function countQueuedFrom(attendance: CoffeeBoardAttendance[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of attendance) {
    if (row.person?.status !== 'welcome_coffee' && row.person?.status !== 'pending_signup') continue;
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

export function latestAttendedCoffeeByPerson(attendance: CoffeeBoardAttendance[]): Map<string, string> {
  const latest = new Map<string, string>();
  for (const row of attendance) {
    if (!row.attended || !row.coffee_event) continue;
    const current = latest.get(row.person_id);
    if (!current || row.coffee_event.event_date > current) latest.set(row.person_id, row.coffee_event.event_date);
  }
  return latest;
}

export function selectOrphanPeople(
  people: CoffeeBoardPerson[],
  attendance: Pick<CoffeeBoardAttendance, 'person_id' | 'attended'>[],
): string[] {
  const withOpenSeat = new Set(attendance.filter((a) => !a.attended).map((a) => a.person_id));
  return people.filter((p) => p.status === 'welcome_coffee' && !withOpenSeat.has(p.id)).map((p) => p.id);
}

export async function attachPeopleToCoffee(personIds: string[], eventId: string): Promise<void> {
  await Promise.all(personIds.map((id) => placeInCoffee(id, eventId)));
}
