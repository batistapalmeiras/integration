// Local
import { PastoralNote } from '../domain/pastoralNotes';
import { supabase } from '../lib/supabase';

export async function listPastoralNotes(personId: string): Promise<PastoralNote[]> {
  const { data, error } = await supabase
    .from('pastoral_notes')
    .select('id, body, created_at')
    .eq('person_id', personId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as { id: string; body: string; created_at: string }[]).map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
  }));
}
