// Local
import { Council, CouncilRoster } from '../domain/councils';
import { byName } from '../domain/text';
import { supabase } from '../lib/supabase';
import { toEntryType } from '../types/church';

const UNIQUE_VIOLATION = '23505';

export async function listCouncils(): Promise<Council[]> {
  const { data, error } = await supabase
    .from('councils')
    .select('id, meeting_date, people(count)')
    .order('meeting_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    meetingDate: row.meeting_date,
    memberCount: row.people[0]?.count ?? 0,
  }));
}

export async function getCouncilRoster(id: string): Promise<CouncilRoster> {
  const { data, error } = await supabase
    .from('councils')
    .select('id, meeting_date, people(id, name, entry_type)')
    .eq('id', id)
    .single();
  if (error) throw error;
  const members = data.people
    .map((person) => ({ personId: person.id, name: person.name, entryType: toEntryType(person.entry_type) }))
    .sort(byName);
  return { council: { id: data.id, meetingDate: data.meeting_date, memberCount: members.length }, members };
}

function throwCouncilError(error: { code?: string } | null): void {
  if (error?.code === UNIQUE_VIOLATION) throw new Error('Já existe um Conselho Administrativo nessa data.');
  if (error) throw error;
}

export async function createCouncil(meetingDate: string): Promise<void> {
  const { error } = await supabase.from('councils').insert({ meeting_date: meetingDate });
  throwCouncilError(error);
}

export async function updateCouncil(id: string, meetingDate: string): Promise<void> {
  const { error } = await supabase.from('councils').update({ meeting_date: meetingDate }).eq('id', id);
  throwCouncilError(error);
}

export async function deleteCouncil(id: string): Promise<void> {
  const { error } = await supabase.from('councils').delete().eq('id', id);
  if (error) throw error;
}
