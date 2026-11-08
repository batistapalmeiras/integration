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
import { TableInsert, TableRow } from '../lib/database.types';

type Table = 'ministries' | 'small_groups';

const isSmallGroups = (table: Table) => table === 'small_groups';

const WEEK_DAYS: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const toWeekDay = (value: string | null): WeekDay | null => WEEK_DAYS.find((day) => day === value) ?? null;

const fromMinistry = (row: Pick<TableRow<'ministries'>, 'id' | 'name' | 'leaders'>): CommunityGroup => ({
  id: row.id,
  name: row.name,
  leaders: row.leaders ?? [],
  hosts: [],
  meetingDay: null,
});

const fromSmallGroup = (
  row: Pick<TableRow<'small_groups'>, 'id' | 'name' | 'leaders' | 'hosts' | 'meeting_day'>,
): CommunityGroup => ({
  id: row.id,
  name: row.name,
  leaders: row.leaders ?? [],
  hosts: row.hosts ?? [],
  meetingDay: toWeekDay(row.meeting_day),
});

const ministryPayload = (input: GroupInput): TableInsert<'ministries'> => ({
  name: input.name,
  leaders: input.leaders,
});

const smallGroupPayload = (input: GroupInput): TableInsert<'small_groups'> => ({
  name: input.name,
  leaders: input.leaders,
  hosts: input.hosts,
  meeting_day: input.meetingDay,
});

async function listGroups(table: Table): Promise<CommunityGroup[]> {
  if (isSmallGroups(table)) {
    const { data, error } = await supabase
      .from('small_groups')
      .select('id, name, leaders, hosts, meeting_day')
      .order('name');
    if (error) throw error;
    return data.map(fromSmallGroup);
  }
  const { data, error } = await supabase.from('ministries').select('id, name, leaders').order('name');
  if (error) throw error;
  return data.map(fromMinistry);
}

async function listGroupsWithCounts(table: Table): Promise<CommunityGroupWithCount[]> {
  if (isSmallGroups(table)) {
    const { data, error } = await supabase
      .from('small_groups')
      .select('id, name, leaders, hosts, meeting_day, people(count)')
      .order('name');
    if (error) throw error;
    return data.map((row) => ({ ...fromSmallGroup(row), peopleCount: row.people[0]?.count ?? 0 }));
  }
  const { data, error } = await supabase
    .from('ministries')
    .select('id, name, leaders, person_ministries(count)')
    .order('name');
  if (error) throw error;
  return data.map((row) => ({ ...fromMinistry(row), peopleCount: row.person_ministries[0]?.count ?? 0 }));
}

async function createGroup(table: Table, input: GroupInput): Promise<void> {
  const { error } = isSmallGroups(table)
    ? await supabase.from('small_groups').insert(smallGroupPayload(input))
    : await supabase.from('ministries').insert(ministryPayload(input));
  if (error) throw error;
}

async function updateGroup(table: Table, id: string, input: GroupInput): Promise<void> {
  const { error } = isSmallGroups(table)
    ? await supabase.from('small_groups').update(smallGroupPayload(input)).eq('id', id)
    : await supabase.from('ministries').update(ministryPayload(input)).eq('id', id);
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
  return data ?? [];
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
  return data ?? [];
}

async function listMinistryPeople(id: string): Promise<PersonInGroup[]> {
  const { data, error } = await supabase
    .from('person_ministries')
    .select('person:people(id, name)')
    .eq('ministry_id', id);
  if (error) throw error;
  return (data ?? []).map((row) => row.person).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
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
  if (isSmallGroups(table)) {
    const { data, error } = await supabase
      .from('small_groups')
      .select('id, name, leaders, hosts, meeting_day')
      .eq('id', id)
      .single();
    if (error) throw error;
    return fromSmallGroup(data);
  }
  const { data, error } = await supabase.from('ministries').select('id, name, leaders').eq('id', id).single();
  if (error) throw error;
  return fromMinistry(data);
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
