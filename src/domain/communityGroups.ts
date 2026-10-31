// Libs
import { supabase } from '../lib/supabase';

export interface CommunityGroup {
  id: string;
  name: string;
  leaders: string[];
  hosts: string[];
}

export interface PersonInGroup {
  id: string;
  name: string;
}

type Table = 'ministries' | 'small_groups';

const hasHosts = (table: Table) => table === 'small_groups';

function toGroup(table: Table, row: { id: string; name: string; leaders: string[] | null; hosts?: string[] | null }): CommunityGroup {
  return { id: row.id, name: row.name, leaders: row.leaders ?? [], hosts: hasHosts(table) ? row.hosts ?? [] : [] };
}

async function listGroups(table: Table): Promise<CommunityGroup[]> {
  const columns = hasHosts(table) ? 'id, name, leaders, hosts' : 'id, name, leaders';
  const { data, error } = await supabase.from(table).select(columns).order('name');
  if (error) throw error;
  return (data ?? []).map((row) => toGroup(table, row as never));
}

async function createGroup(table: Table, name: string, leaders: string[], hosts: string[]): Promise<void> {
  const payload: Record<string, unknown> = { name, leaders };
  if (hasHosts(table)) payload.hosts = hosts;
  const { error } = await supabase.from(table).insert(payload);
  if (error) throw error;
}

async function updateGroup(table: Table, id: string, name: string, leaders: string[], hosts: string[]): Promise<void> {
  const payload: Record<string, unknown> = { name, leaders };
  if (hasHosts(table)) payload.hosts = hosts;
  const { error } = await supabase.from(table).update(payload).eq('id', id);
  if (error) throw error;
}

async function deleteGroup(table: Table, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

async function countSmallGroupPeople(id: string): Promise<number> {
  const { count, error } = await supabase
    .from('people')
    .select('id', { count: 'exact', head: true })
    .eq('small_group_id', id);
  if (error) throw error;
  return count ?? 0;
}

async function listSmallGroupPeople(id: string): Promise<PersonInGroup[]> {
  const { data, error } = await supabase.from('people').select('id, name').eq('small_group_id', id).order('name');
  if (error) throw error;
  return (data ?? []) as PersonInGroup[];
}

async function countMinistryPeople(id: string): Promise<number> {
  const { count, error } = await supabase
    .from('person_ministries')
    .select('person_id', { count: 'exact', head: true })
    .eq('ministry_id', id);
  if (error) throw error;
  return count ?? 0;
}

async function listMinistryPeople(id: string): Promise<PersonInGroup[]> {
  const { data, error } = await supabase.from('person_ministries').select('person:people(id, name)').eq('ministry_id', id);
  if (error) throw error;
  return ((data ?? []) as unknown as { person: PersonInGroup }[])
    .map((row) => row.person)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function getPersonMinistryIds(personId: string): Promise<string[]> {
  const { data, error } = await supabase.from('person_ministries').select('ministry_id').eq('person_id', personId);
  if (error) throw error;
  return ((data ?? []) as { ministry_id: string }[]).map((row) => row.ministry_id);
}

export async function setPersonMinistries(personId: string, ministryIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase.from('person_ministries').delete().eq('person_id', personId);
  if (deleteError) throw deleteError;
  if (ministryIds.length === 0) return;
  const { error } = await supabase
    .from('person_ministries')
    .insert(ministryIds.map((ministryId) => ({ person_id: personId, ministry_id: ministryId })));
  if (error) throw error;
}

async function getGroup(table: Table, id: string): Promise<CommunityGroup> {
  const columns = hasHosts(table) ? 'id, name, leaders, hosts' : 'id, name, leaders';
  const { data, error } = await supabase.from(table).select(columns).eq('id', id).single();
  if (error) throw error;
  return toGroup(table, data as never);
}

export const listMinistries = () => listGroups('ministries');
export const createMinistry = (name: string, leaders: string[]) => createGroup('ministries', name, leaders, []);
export const updateMinistry = (id: string, name: string, leaders: string[]) =>
  updateGroup('ministries', id, name, leaders, []);
export const deleteMinistry = (id: string) => deleteGroup('ministries', id);
export const countPeopleInMinistry = countMinistryPeople;
export const listPeopleInMinistry = listMinistryPeople;
export const getMinistry = (id: string) => getGroup('ministries', id);

export const listSmallGroups = () => listGroups('small_groups');
export const createSmallGroup = (name: string, leaders: string[], hosts: string[]) =>
  createGroup('small_groups', name, leaders, hosts);
export const updateSmallGroup = (id: string, name: string, leaders: string[], hosts: string[]) =>
  updateGroup('small_groups', id, name, leaders, hosts);
export const deleteSmallGroup = (id: string) => deleteGroup('small_groups', id);
export const countPeopleInSmallGroup = (id: string) => countSmallGroupPeople(id);
export const listPeopleInSmallGroup = (id: string) => listSmallGroupPeople(id);
export const getSmallGroup = (id: string) => getGroup('small_groups', id);

export async function getPersonCommunityNames(
  personId: string,
): Promise<{ ministryNames: string[]; smallGroupName: string | null }> {
  const [person, ministries] = await Promise.all([
    supabase.from('people').select('small_group:small_groups(name)').eq('id', personId).single(),
    supabase.from('person_ministries').select('ministry:ministries(name)').eq('person_id', personId),
  ]);
  if (person.error) throw person.error;
  if (ministries.error) throw ministries.error;

  const row = person.data as unknown as { small_group: { name: string } | null };
  const names = ((ministries.data ?? []) as unknown as { ministry: { name: string } }[]).map((m) => m.ministry.name);
  return { ministryNames: names.sort((a, b) => a.localeCompare(b, 'pt-BR')), smallGroupName: row.small_group?.name ?? null };
}
