// Local
import {
  COFFEE_LIST_STATUSES,
  CoffeeBoard,
  CoffeeEventRef,
  currentCoffeeAttendance,
  EnrollableCoffeePerson,
  isSeatedInUpcomingCoffee,
  PersonCoffeeAttendance,
  upcomingCoffeeEvent,
} from '../domain/cafeSchedule';
import { supabase } from '../lib/supabase';
import { todayKey } from '../domain/dates';
import { fromIntegration } from './integrationPeople';

async function listCoffeeEvents(): Promise<CoffeeEventRef[]> {
  const { data, error } = await supabase
    .from('coffee_events')
    .select('id, event_date')
    .order('event_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function findFutureCoffeeEvent(): Promise<CoffeeEventRef | null> {
  return upcomingCoffeeEvent(await listCoffeeEvents(), todayKey());
}

export async function getUpcomingCoffeeRoster(): Promise<{ eventDate: string; rosterCount: number } | null> {
  const future = await findFutureCoffeeEvent();
  if (!future) return null;
  const { data, error } = await supabase
    .from('coffee_attendance')
    .select('person:people!inner(status, signup_window_from)')
    .eq('coffee_event_id', future.id);
  if (error) throw error;
  const rows = data ?? [];
  return {
    eventDate: future.event_date,
    rosterCount: rows.filter((row) => isSeatedInUpcomingCoffee(row.person)).length,
  };
}

export async function insertCoffeeEvent(eventDate: string): Promise<string> {
  const { data, error } = await supabase.from('coffee_events').insert({ event_date: eventDate }).select('id').single();
  if (error) throw error;
  return data.id;
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

  const rows = data ?? [];
  if (rows.length === 0) return null;
  return (
    rows
      .map((r) => r.coffee_event.event_date)
      .sort()
      .at(-1) ?? null
  );
}

export async function placeInCoffee(personId: string, eventId: string): Promise<string> {
  const { data, error } = await supabase.rpc('place_in_coffee', { p_person_id: personId, p_coffee_event_id: eventId });
  if (error) throw error;
  return data;
}

export async function attachToNextWelcomeCoffee(personId: string): Promise<void> {
  const future = await findFutureCoffeeEvent();
  if (!future) throw new Error('Nenhum café de boas-vindas agendado.');
  await placeInCoffee(personId, future.id);
}

export async function getCoffeeAttendanceForPerson(personId: string): Promise<PersonCoffeeAttendance | null> {
  const { data, error } = await supabase
    .from('coffee_attendance')
    .select('id, attended, person_id, coffee_event:coffee_events(event_date)')
    .eq('person_id', personId);
  if (error) throw error;

  const rows = data ?? [];
  const [current] = currentCoffeeAttendance(rows);
  return current
    ? { id: current.id, attended: current.attended, eventDate: current.coffee_event?.event_date ?? '' }
    : null;
}

export async function listEnrollableCoffeePeople(eventId: string): Promise<EnrollableCoffeePerson[]> {
  const { data: attending, error: attendingError } = await supabase
    .from('coffee_attendance')
    .select('person_id')
    .eq('coffee_event_id', eventId);
  if (attendingError) throw attendingError;
  const attendingIds = new Set((attending ?? []).map((row) => row.person_id));

  const { data, error } = await fromIntegration(supabase.from('people').select('id, name'))
    .in('status', ['initial_contact', 'retry_contact'])
    .order('name');
  if (error) throw error;
  return (data ?? []).filter((p) => !attendingIds.has(p.id));
}

export async function markCoffeeAttended(attendanceId: string, personId: string, actorId?: string): Promise<void> {
  const { error } = await supabase.rpc('mark_coffee_attended', {
    p_attendance_id: attendanceId,
    p_person_id: personId,
    p_actor_id: actorId,
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
    .update({
      status: 'retry_contact',
      coffee_retry_used: true,
      whatsapp_opened_at: null,
      updated_at: new Date().toISOString(),
    })
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

async function fetchBoard(onlyPeopleInProgress: boolean): Promise<CoffeeBoard> {
  const attendanceQuery = onlyPeopleInProgress
    ? supabase
        .from('coffee_attendance')
        .select(
          '*, person:people!inner(id,name,phone,status,class_invite_sent_at,signup_window_from), coffee_event:coffee_events(event_date)',
        )
        .in('person.status', COFFEE_LIST_STATUSES)
    : supabase
        .from('coffee_attendance')
        .select(
          '*, person:people(id,name,phone,status,class_invite_sent_at,signup_window_from), coffee_event:coffee_events(event_date)',
        );

  const [events, attendance] = await Promise.all([
    supabase.from('coffee_events').select('*').order('event_date', { ascending: true }),
    attendanceQuery,
  ]);

  const failure = events.error ?? attendance.error;
  if (failure) throw failure;

  return {
    events: (events.data ?? []) as CoffeeBoard['events'],
    attendance: attendance.data ?? [],
  };
}

export const fetchCoffeeBoard = () => fetchBoard(true);

export const fetchCoffeeHistoryBoard = () => fetchBoard(false);

export async function leaveOpenCoffeeSeat(personId: string): Promise<void> {
  const { error } = await supabase.from('coffee_attendance').delete().eq('person_id', personId).eq('attended', false);
  if (error) throw error;
}

export async function deleteCoffeeEvent(id: string): Promise<void> {
  const { error } = await supabase.from('coffee_events').delete().eq('id', id);
  if (error) throw error;
}
