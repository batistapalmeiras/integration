// Libs
import { supabase } from '../lib/supabase';

export function firstSundayOfMonth(monthValue: string): string {
  const [year, month] = monthValue.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const offset = date.getDay() === 0 ? 0 : 7 - date.getDay();
  date.setDate(1 + offset);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function nextWelcomeCoffeeDate(referenceDate = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const todayKey = referenceDate.toISOString().slice(0, 10);

  const thisMonthValue = `${year}-${String(month + 1).padStart(2, '0')}`;
  const thisMonthFirstSunday = firstSundayOfMonth(thisMonthValue);
  if (thisMonthFirstSunday >= todayKey) return thisMonthFirstSunday;

  const next = new Date(year, month + 1, 1);
  const nextMonthValue = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
  return firstSundayOfMonth(nextMonthValue);
}

export async function findOrCreateCoffeeEvent(eventDate: string): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from('coffee_events')
    .select('id')
    .eq('event_date', eventDate)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from('coffee_events')
    .insert({ event_date: eventDate })
    .select('id')
    .single();
  if (createError) throw createError;
  return created.id as string;
}

export async function attachToNextWelcomeCoffee(personId: string): Promise<void> {
  const eventId = await findOrCreateCoffeeEvent(nextWelcomeCoffeeDate());
  const { error } = await supabase
    .from('coffee_attendance')
    .upsert({ person_id: personId, coffee_event_id: eventId }, { onConflict: 'person_id,coffee_event_id' });
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

  // Self-heal: same idea as the Coffee list's own self-heal — a person can
  // reach 'welcome_coffee' without an attendance row yet if this page is
  // opened before the Coffee list has ever run.
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

export async function markCoffeeNotAttended(personId: string, actorId?: string): Promise<void> {
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
    note: 'Não compareceu ao café de boas-vindas',
  });
}

// Only logs the attempt — person stays in 'welcome_coffee' so they keep
// showing up for a retry (unlimited retries, same rule as initial contact).
export async function markClassInviteNoResponse(personId: string, actorId?: string): Promise<void> {
  const { error } = await supabase.from('contact_attempts').insert({
    person_id: personId,
    channel: 'text',
    result: 'no_response',
    made_by: actorId,
  });
  if (error) throw error;
}

// Attended the coffee but doesn't want to join the classes — one of the two
// closed archived-exit points for this pipeline.
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
