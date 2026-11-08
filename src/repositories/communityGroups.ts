// Local
import {
  CommunityGroup,
  CommunityGroupWithCount,
  CommunityOverview,
  GroupInput,
  PersonInGroup,
  WeekDay,
} from '../domain/communityGroups';
import { supabase } from '../lib/supabase';

type Table = 'ministries' | 'small_groups';

const isSmallGroups = (table: Table) => table === 'small_groups';

const groupColumns = (table: Table) =>
  isSmallGroups(table) ? 'id, name, leaders, hosts, meeting_day' : 'id, name, leaders';

interface GroupRecord {
  id: string;
  name: string;
  leaders: string[] | null;
  hosts?: string[] | null;
  meeting_day?: WeekDay | null;
}

function toGroup(table: Table, row: GroupRecord): CommunityGroup {
  const smallGroup = isSmallGroups(table);
  return {
    id: row.id,
    name: row.name,
    leaders: row.leaders ?? [],
    hosts: smallGroup ? (row.hosts ?? []) : [],
    meetingDay: smallGroup ? (row.meeting_day ?? null) : null,
  };
}

function toPayload(table: Table, input: GroupInput): Record<string, unknown> {
  const payload: Record<string, unknown> = { name: input.name, leaders: input.leaders };
  if (isSmallGroups(table)) {
    payload.hosts = input.hosts;
    payload.meeting_day = input.meetingDay;
  }
  return payload;
}

async function listGroups(table: Table): Promise<CommunityGroup[]> {
  const columns = groupColumns(table);
  const { data, error } = await supabase.from(table).select(columns).order('name');
  if (error) throw error;
  return (data ?? []).map((row) => toGroup(table, row as never));
}

async function listGroupsWithCounts(table: Table): Promise<CommunityGroupWithCount[]> {
  const columns = `${groupColumns(table)}, ${isSmallGroups(table) ? 'people(count)' : 'person_ministries(count)'}`;
  const { data, error } = await supabase.from(table).select(columns).order('name');
  if (error) throw error;
  return (data ?? []).map((row) => {
    const counted = row as unknown as { people?: { count: number }[]; person_ministries?: { count: number }[] };
    const peopleCount = (isSmallGroups(table) ? counted.people : counted.person_ministries)?.[0]?.count ?? 0;
    return { ...toGroup(table, row as never), peopleCount };
  });
}

async function createGroup(table: Table, input: GroupInput): Promise<void> {
  const { error } = await supabase.from(table).insert(toPayload(table, input));
  if (error) throw error;
}

async function updateGroup(table: Table, id: string, input: GroupInput): Promise<void> {
  const { error } = await supabase.from(table).update(toPayload(table, input)).eq('id', id);
  if (error) throw error;
}

async function deleteGroup(table: Table, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function listMembers({ withoutSmallGroup = false } = {}): Promise<PersonInGroup[]> {
  const query = supabase.from('people').select('id, name').eq('status', 'member');
  const { data, error } = await (withoutSmallGroup ? query.is('small_group_id', null) : query).order('name');
  if (error) throw error;
  return (data ?? []) as PersonInGroup[];
}

export async function getCommunityOverview(): Promise<CommunityOverview> {
  const [smallGroups, ministries] = await Promise.all([
    supabase.from('small_groups').select('id', { count: 'exact', head: true }),
    supabase.from('ministries').select('id', { count: 'exact', head: true }),
  ]);
  const failure = smallGroups.error ?? ministries.error;
  if (failure) throw failure;
  return { smallGroups: smallGroups.count ?? 0, ministries: ministries.count ?? 0 };
}

export async function addPeopleToSmallGroup(groupId: string, personIds: string[]): Promise<void> {
  const { error } = await supabase.from('people').update({ small_group_id: groupId }).in('id', personIds);
  if (error) throw error;
}

export async function addPeopleToMinistry(ministryId: string, personIds: string[]): Promise<void> {
  const { error } = await supabase.from('person_ministries').upsert(
    personIds.map((personId) => ({ person_id: personId, ministry_id: ministryId })),
    { onConflict: 'person_id,ministry_id', ignoreDuplicates: true },
  );
  if (error) throw error;
}

export async function removePersonFromSmallGroup(personId: string): Promise<void> {
  const { error } = await supabase.from('people').update({ small_group_id: null }).eq('id', personId);
  if (error) throw error;
}

export async function removePersonFromMinistry(ministryId: string, personId: string): Promise<void> {
  const { error } = await supabase
    .from('person_ministries')
    .delete()
    .eq('ministry_id', ministryId)
    .eq('person_id', personId);
  if (error) throw error;
}

async function listSmallGroupPeople(id: string): Promise<PersonInGroup[]> {
  const { data, error } = await supabase.from('people').select('id, name').eq('small_group_id', id).order('name');
  if (error) throw error;
  return (data ?? []) as PersonInGroup[];
}

async function listMinistryPeople(id: string): Promise<PersonInGroup[]> {
  const { data, error } = await supabase
    .from('person_ministries')
    .select('person:people(id, name)')
    .eq('ministry_id', id);
  if (error) throw error;
  return ((data ?? []) as unknown as { person: PersonInGroup }[])
    .map((row) => row.person)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
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
  const { data, error } = await supabase.from(table).select(groupColumns(table)).eq('id', id).single();
  if (error) throw error;
  return toGroup(table, data as never);
}

export const listMinistries = () => listGroups('ministries');

export const listMinistriesWithCounts = () => listGroupsWithCounts('ministries');

export const createMinistry = (input: GroupInput) => createGroup('ministries', input);

export const updateMinistry = (id: string, input: GroupInput) => updateGroup('ministries', id, input);

export const deleteMinistry = (id: string) => deleteGroup('ministries', id);

export const listPeopleInMinistry = listMinistryPeople;

export const getMinistry = (id: string) => getGroup('ministries', id);

export const listSmallGroups = () => listGroups('small_groups');

export const listSmallGroupsWithCounts = () => listGroupsWithCounts('small_groups');

export const createSmallGroup = (input: GroupInput) => createGroup('small_groups', input);

export const updateSmallGroup = (id: string, input: GroupInput) => updateGroup('small_groups', id, input);

export const deleteSmallGroup = (id: string) => deleteGroup('small_groups', id);

export const listPeopleInSmallGroup = (id: string) => listSmallGroupPeople(id);

export const getSmallGroup = (id: string) => getGroup('small_groups', id);
