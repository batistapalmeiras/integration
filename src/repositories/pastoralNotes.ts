// Local
import { PastoralNote } from '../domain/pastoralNotes';
import { supabase } from '../lib/supabase';

export async function listPastoralNotes(personId: string): Promise<PastoralNote[]> {
  const { data, error } = await supabase
    .from('pastoral_notes')
    .select('id, body, created_at, author:profiles(person:people!profiles_person_id_fkey(name))')
    .eq('person_id', personId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    authorName: row.author?.person?.name ?? null,
  }));
}

export async function addPastoralNote(personId: string, body: string, authorId: string): Promise<void> {
  const { error } = await supabase
    .from('pastoral_notes')
    .insert({ person_id: personId, body: body.trim(), created_by: authorId });
  if (error) throw error;
}

export async function deletePastoralNote(id: string): Promise<void> {
  const { error } = await supabase.from('pastoral_notes').delete().eq('id', id);
  if (error) throw error;
}
