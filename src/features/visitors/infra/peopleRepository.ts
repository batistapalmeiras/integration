// Libs
import { supabase } from '../../../lib/supabase';
// Local
import { Person, PersonStatus } from '../domain/types';

export async function fetchPerson(id: string): Promise<Person> {
  const { data, error } = await supabase.from('people').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Person;
}

export async function updatePersonFields(id: string, fields: Record<string, unknown>): Promise<Person> {
  const { data, error } = await supabase.from('people').update(fields).eq('id', id).select('*').single();
  if (error) throw error;
  return data as Person;
}

export async function updatePersonStatus(
  id: string,
  toStatus: PersonStatus,
  extra: Record<string, unknown> = {},
): Promise<Person> {
  return updatePersonFields(id, { status: toStatus, updated_at: new Date().toISOString(), ...extra });
}

export async function insertStatusHistory(entry: {
  personId: string;
  fromStatus: PersonStatus;
  toStatus: PersonStatus;
  changedBy?: string;
  note?: string | null;
}): Promise<void> {
  const { error } = await supabase.from('status_history').insert({
    person_id: entry.personId,
    from_status: entry.fromStatus,
    to_status: entry.toStatus,
    changed_by: entry.changedBy,
    note: entry.note ?? null,
  });
  if (error) throw error;
}

export async function insertContactAttempt(personId: string, result: string, madeBy?: string): Promise<void> {
  const { error } = await supabase
    .from('contact_attempts')
    .insert({ person_id: personId, channel: 'text', result, made_by: madeBy });
  if (error) throw error;
}

export async function updateContactAttemptResult(attemptId: string, result: string): Promise<void> {
  const { error } = await supabase.from('contact_attempts').update({ result }).eq('id', attemptId);
  if (error) throw error;
}

export interface PersonProfileSummary {
  coffeeDate: string | null;
  cohortName: string | null;
  smallGroupName: string | null;
  ministryNames: string[];
  ministryIds: string[];
}

interface PersonProfileRow {
  small_group: { name: string } | null;
  person_ministries: { ministry_id: string; ministry: { name: string } | null }[];
  enrollments: { created_at: string; cohort: { name: string } | null }[];
  coffee_attendance: { attended: boolean; coffee_event: { event_date: string } | null }[];
}

export async function fetchPersonProfileSummary(personId: string): Promise<PersonProfileSummary> {
  const { data, error } = await supabase
    .from('people')
    .select(
      'small_group:small_groups(name), person_ministries(ministry_id, ministry:ministries(name)), enrollments(created_at, cohort:cohorts(name)), coffee_attendance(attended, coffee_event:coffee_events(event_date))',
    )
    .eq('id', personId)
    .single();
  if (error) throw error;

  const row = data as unknown as PersonProfileRow;
  const latestEnrollment = [...row.enrollments].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const attendedDates = row.coffee_attendance
    .filter((a) => a.attended && a.coffee_event)
    .map((a) => a.coffee_event!.event_date)
    .sort();

  return {
    coffeeDate: attendedDates.at(-1) ?? null,
    cohortName: latestEnrollment?.cohort?.name ?? null,
    smallGroupName: row.small_group?.name ?? null,
    ministryNames: row.person_ministries
      .map((m) => m.ministry?.name)
      .filter((name): name is string => !!name)
      .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    ministryIds: row.person_ministries.map((m) => m.ministry_id),
  };
}

export async function fetchLastContactAttempt(
  personId: string,
): Promise<{ id: string; result: string; created_at: string } | null> {
  const { data } = await supabase
    .from('contact_attempts')
    .select('id, result, created_at')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as { id: string; result: string; created_at: string } | null;
}

export async function deletePersonRow(id: string): Promise<void> {
  const { error } = await supabase.from('people').delete().eq('id', id);
  if (error) throw error;
}

export async function findPersonByPhone(digits: string): Promise<Person | null> {
  const { data, error } = await supabase.from('people').select('*').eq('phone', digits).limit(1).maybeSingle();
  if (error) throw error;
  return data as Person | null;
}
