// Libs
import { supabase } from '../lib/supabase';

// hosts ("anfitriões") only exists on small_groups — a PG meets at someone's
// home, a ministry has no such role. Kept on the shared shape (always []
// for ministries) so GroupTable/GroupModal can stay one component for both.
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

async function countPeople(column: 'ministry_id' | 'small_group_id', id: string): Promise<number> {
  const { count, error } = await supabase.from('people').select('id', { count: 'exact', head: true }).eq(column, id);
  if (error) throw error;
  return count ?? 0;
}

async function listPeople(column: 'ministry_id' | 'small_group_id', id: string): Promise<PersonInGroup[]> {
  const { data, error } = await supabase.from('people').select('id, name').eq(column, id).order('name');
  if (error) throw error;
  return (data ?? []) as PersonInGroup[];
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
export const countPeopleInMinistry = (id: string) => countPeople('ministry_id', id);
export const listPeopleInMinistry = (id: string) => listPeople('ministry_id', id);
export const getMinistry = (id: string) => getGroup('ministries', id);

export const listSmallGroups = () => listGroups('small_groups');
export const createSmallGroup = (name: string, leaders: string[], hosts: string[]) =>
  createGroup('small_groups', name, leaders, hosts);
export const updateSmallGroup = (id: string, name: string, leaders: string[], hosts: string[]) =>
  updateGroup('small_groups', id, name, leaders, hosts);
export const deleteSmallGroup = (id: string) => deleteGroup('small_groups', id);
export const countPeopleInSmallGroup = (id: string) => countPeople('small_group_id', id);
export const listPeopleInSmallGroup = (id: string) => listPeople('small_group_id', id);
export const getSmallGroup = (id: string) => getGroup('small_groups', id);

// For display only (e.g. the visitor's Detalhes page) — resolves both
// names in one round trip instead of the caller joining client-side.
export async function getPersonCommunityNames(
  personId: string,
): Promise<{ ministryName: string | null; smallGroupName: string | null }> {
  const { data, error } = await supabase
    .from('people')
    .select('ministry:ministries(name), small_group:small_groups(name)')
    .eq('id', personId)
    .single();
  if (error) throw error;

  const row = data as unknown as { ministry: { name: string } | null; small_group: { name: string } | null };
  return { ministryName: row.ministry?.name ?? null, smallGroupName: row.small_group?.name ?? null };
}
