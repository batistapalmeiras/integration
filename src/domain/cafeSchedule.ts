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

async function insertCoffeeEvent(eventDate: string): Promise<string> {
  const { data, error } = await supabase.from('coffee_events').insert({ event_date: eventDate }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function createOrUpdateCoffeeEvent(eventDate: string): Promise<string> {
  const future = await findFutureCoffeeEvent();
  if (future) {
    const { error } = await supabase.from('coffee_events').update({ event_date: eventDate }).eq('id', future.id);
    if (error) throw error;
    return future.id;
  }
  return insertCoffeeEvent(eventDate);
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

export async function attachToNextWelcomeCoffee(personId: string): Promise<void> {
  const future = await findFutureCoffeeEvent();
  if (!future) throw new Error('Nenhum café de boas-vindas agendado.');

  const { error } = await supabase
    .from('coffee_attendance')
    .upsert({ person_id: personId, coffee_event_id: future.id }, { onConflict: 'person_id,coffee_event_id' });
  if (error) throw error;
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

export async function getCoffeeAttendanceForPerson(
  personId: string,
): Promise<{ id: string; attended: boolean } | null> {
  const eventId = await resolveCurrentCoffeeEventId();
  if (!eventId) return null;

  const { data: existing, error: selectError } = await supabase
    .from('coffee_attendance')
    .select('id, attended')
    .eq('person_id', personId)
    .eq('coffee_event_id', eventId)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return existing as { id: string; attended: boolean };

  const { data: created, error: insertError } = await supabase
    .from('coffee_attendance')
    .insert({ person_id: personId, coffee_event_id: eventId })
    .select('id, attended')
    .single();
  if (insertError) throw insertError;
  return created as { id: string; attended: boolean };
}

export async function markCoffeeAttended(attendanceId: string): Promise<void> {
  const { error } = await supabase.from('coffee_attendance').update({ attended: true }).eq('id', attendanceId);
  if (error) throw error;
}

// Person let the volunteer know beforehand they're not coming — distinct
// from a silent no-show (markCoffeeNotAttended), which gets one retry round
// instead of archiving straight away.
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

export async function markCoffeeNotAttended(personId: string, actorId?: string): Promise<void> {
  const { error: statusError } = await supabase
    .from('people')
    .update({ status: 'retry_contact', coffee_retry_used: true, whatsapp_opened_at: null, updated_at: new Date().toISOString() })
    .eq('id', personId);
  if (statusError) throw statusError;

  await supabase.from('status_history').insert({
    person_id: personId,
    from_status: 'welcome_coffee',
    to_status: 'retry_contact',
    changed_by: actorId,
    note: 'Confirmou presença mas não compareceu ao café — retomando contato para o próximo café',
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
    from_status: 'welcome_coffee',
    to_status: 'archived',
    changed_by: actorId,
    note: 'Recusou o convite para as aulas de Integração',
  });
}
