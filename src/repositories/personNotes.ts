// Local
import { PersonNote } from '../domain/personNotes';
import { supabase } from '../lib/supabase';

export async function listPersonNotes(personId: string): Promise<PersonNote[]> {
  const { data, error } = await supabase.rpc('list_person_notes', { p_person_id: personId });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    authorName: row.author_name,
    private: row.private,
  }));
}

export async function addPersonNote(personId: string, body: string, authorId: string): Promise<void> {
  const { error } = await supabase
    .from('pastoral_notes')
    .insert({ person_id: personId, body: body.trim(), created_by: authorId });
  if (error) throw error;
}

export async function deletePersonNote(id: string): Promise<void> {
  const { error } = await supabase.from('pastoral_notes').delete().eq('id', id);
  if (error) throw error;
}
