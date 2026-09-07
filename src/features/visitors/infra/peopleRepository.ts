// Libs
import { supabase } from '../../../lib/supabase';
// Local
import { Person, PersonStatus } from '../domain/types';

export async function fetchPerson(id: string): Promise<Person> {
  const { data, error } = await supabase.from('people').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Person;
}

// Doesn't stamp updated_at itself — callers pass it explicitly when they
// want it, matching each call site's pre-existing behavior exactly (e.g.
// markWhatsAppOpened deliberately never touched updated_at).
export async function updatePersonFields(id: string, fields: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('people').update(fields).eq('id', id);
  if (error) throw error;
}

export async function updatePersonStatus(
  id: string,
  toStatus: PersonStatus,
  extra: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase
    .from('people')
    .update({ status: toStatus, updated_at: new Date().toISOString(), ...extra })
    .eq('id', id);
  if (error) throw error;
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

export async function clearWhatsAppOpened(id: string): Promise<void> {
  const { error } = await supabase.from('people').update({ whatsapp_opened_at: null }).eq('id', id);
  if (error) throw error;
}

export async function deletePersonRow(id: string): Promise<void> {
  const { error } = await supabase.from('people').delete().eq('id', id);
  if (error) throw error;
}
