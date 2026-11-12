// Local
import { byName } from '../domain/text';
import {
  CommunityGroup,
  CommunityGroupWithCount,
  CommunityOverview,
  GroupInput,
  GroupOption,
  PersonInGroup,
  WeekDay,
} from '../domain/communityGroups';
import { supabase } from '../lib/supabase';
import { TableInsert, TableRow } from '../lib/database.types';
import { Person } from '../types/person';
import { updatePersonFields } from './people';

type Table = 'ministries' | 'small_groups';

const isSmallGroups = (table: Table) => table === 'small_groups';

const WEEK_DAYS: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const toWeekDay = (value: string | null): WeekDay | null => WEEK_DAYS.find((day) => day === value) ?? null;

const SMALL_GROUP_COLUMNS = 'id, name, meeting_day, small_group_roles(person_id, role)';

const MINISTRY_COLUMNS = 'id, name, ministry_leaders(person_id)';

type SmallGroupRole = Pick<TableRow<'small_group_roles'>, 'person_id' | 'role'>;

interface SmallGroupRow extends Pick<TableRow<'small_groups'>, 'id' | 'name' | 'meeting_day'> {
  small_group_roles: SmallGroupRole[];
}

interface MinistryRow extends Pick<TableRow<'ministries'>, 'id' | 'name'> {
  ministry_leaders: Pick<TableRow<'ministry_leaders'>, 'person_id'>[];
}

const toPersonInGroup = (row: Pick<TableRow<'people'>, 'id' | 'name' | 'status'>): PersonInGroup => ({
  id: row.id,
  name: row.name,
  isMember: row.status === 'member',
});

const peopleWithRole = (roles: SmallGroupRole[], role: string) =>
  roles.filter((item) => item.role === role).map((item) => item.person_id);

const fromMinistry = (row: MinistryRow): CommunityGroup => ({
  id: row.id,
  name: row.name,
  leaderIds: row.ministry_leaders.map((leader) => leader.person_id),
  hostIds: [],
  meetingDay: null,
});

const fromSmallGroup = (row: SmallGroupRow): CommunityGroup => ({
  id: row.id,
  name: row.name,
  leaderIds: peopleWithRole(row.small_group_roles, 'leader'),
  hostIds: peopleWithRole(row.small_group_roles, 'host'),
  meetingDay: toWeekDay(row.meeting_day),
});

const ministryPayload = (input: GroupInput): TableInsert<'ministries'> => ({ name: input.name });

const smallGroupPayload = (input: GroupInput): TableInsert<'small_groups'> => ({
  name: input.name,
  meeting_day: input.meetingDay,
});

async function replaceGroupRoles(table: Table, id: string, input: GroupInput): Promise<void> {
  if (isSmallGroups(table)) {
    const { error: deleteError } = await supabase.from('small_group_roles').delete().eq('small_group_id', id);
    if (deleteError) throw deleteError;
    const rows = [
      ...input.leaderIds.map((personId) => ({ small_group_id: id, person_id: personId, role: 'leader' })),
      ...input.hostIds.map((personId) => ({ small_group_id: id, person_id: personId, role: 'host' })),
    ];
    if (rows.length === 0) return;
    const { error } = await supabase.from('small_group_roles').insert(rows);
    if (error) throw error;
    return;
  }
  const { error: deleteError } = await supabase.from('ministry_leaders').delete().eq('ministry_id', id);
  if (deleteError) throw deleteError;
  if (input.leaderIds.length === 0) return;
  const { error } = await supabase
    .from('ministry_leaders')
    .insert(input.leaderIds.map((personId) => ({ ministry_id: id, person_id: personId })));
  if (error) throw error;
}

async function listGroups(table: Table): Promise<GroupOption[]> {
  const { data, error } = await supabase.from(table).select('id, name').order('name');
  if (error) throw error;
  return data;
}

async function listGroupsWithCounts(table: Table): Promise<CommunityGroupWithCount[]> {
  if (isSmallGroups(table)) {
    const { data, error } = await supabase
      .from('small_groups')
      .select('id, name, meeting_day, person_small_groups!person_small_groups_small_group_id_fkey(count)')
      .order('name');
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      name: row.name,
      meetingDay: toWeekDay(row.meeting_day),
      peopleCount: row.person_small_groups[0]?.count ?? 0,
    }));
  }
  const { data, error } = await supabase
    .from('ministries')
    .select('id, name, person_ministries!person_ministries_ministry_id_fkey(count)')
    .order('name');
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    meetingDay: null,
    peopleCount: row.person_ministries[0]?.count ?? 0,
  }));
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
  await replaceGroupRoles(table, id, input);
}

async function deleteGroup(table: Table, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function listMembers(): Promise<PersonInGroup[]> {
  const { data, error } = await supabase.from('people').select('id, name, status').eq('status', 'member').order('name');
  if (error) throw error;
  return (data ?? []).map(toPersonInGroup);
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
  const { error } = await supabase.from('person_small_groups').upsert(
    personIds.map((personId) => ({ person_id: personId, small_group_id: groupId })),
    { onConflict: 'person_id,small_group_id', ignoreDuplicates: true },
  );
  if (error) throw error;
}

export async function addPeopleToMinistry(ministryId: string, personIds: string[]): Promise<void> {
  const { error } = await supabase.from('person_ministries').upsert(
    personIds.map((personId) => ({ person_id: personId, ministry_id: ministryId })),
    { onConflict: 'person_id,ministry_id', ignoreDuplicates: true },
  );
  if (error) throw error;
}

export async function removePersonFromSmallGroup(groupId: string, personId: string): Promise<void> {
  const { error } = await supabase
    .from('person_small_groups')
    .delete()
    .eq('small_group_id', groupId)
    .eq('person_id', personId);
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
  const { data, error } = await supabase
    .from('person_small_groups')
    .select('person:people(id, name, status)')
    .eq('small_group_id', id);
  if (error) throw error;
  return (data ?? []).map((row) => toPersonInGroup(row.person)).sort(byName);
}

async function listMinistryPeople(id: string): Promise<PersonInGroup[]> {
  const { data, error } = await supabase
    .from('person_ministries')
    .select('person:people(id, name, status)')
    .eq('ministry_id', id);
  if (error) throw error;
  return (data ?? []).map((row) => toPersonInGroup(row.person)).sort(byName);
}

async function syncPersonMinistries(personId: string, ministryIds: string[]): Promise<void> {
  const { data, error } = await supabase.from('person_ministries').select('ministry_id').eq('person_id', personId);
  if (error) throw error;
  const current = data.map((row) => row.ministry_id);
  const removed = current.filter((id) => !ministryIds.includes(id));
  const added = ministryIds.filter((id) => !current.includes(id));
  if (removed.length > 0) {
    const result = await supabase.from('person_ministries').delete().eq('person_id', personId).in('ministry_id', removed);
    if (result.error) throw result.error;
  }
  if (added.length > 0) {
    const result = await supabase
      .from('person_ministries')
      .insert(added.map((ministryId) => ({ person_id: personId, ministry_id: ministryId })));
    if (result.error) throw result.error;
  }
}

async function syncPersonSmallGroups(personId: string, smallGroupIds: string[]): Promise<void> {
  const { data, error } = await supabase
    .from('person_small_groups')
    .select('small_group_id')
    .eq('person_id', personId);
  if (error) throw error;
  const current = data.map((row) => row.small_group_id);
  const removed = current.filter((id) => !smallGroupIds.includes(id));
  const added = smallGroupIds.filter((id) => !current.includes(id));
  if (removed.length > 0) {
    const result = await supabase
      .from('person_small_groups')
      .delete()
      .eq('person_id', personId)
      .in('small_group_id', removed);
    if (result.error) throw result.error;
  }
  if (added.length > 0) {
    const result = await supabase
      .from('person_small_groups')
      .insert(added.map((smallGroupId) => ({ person_id: personId, small_group_id: smallGroupId })));
    if (result.error) throw result.error;
  }
}

export async function savePersonCommunity(
  personId: string,
  smallGroupIds: string[],
  ministryIds: string[],
): Promise<Person> {
  await syncPersonSmallGroups(personId, smallGroupIds);
  await syncPersonMinistries(personId, ministryIds);
  return updatePersonFields(personId, { updated_at: new Date().toISOString() });
}

async function getGroup(table: Table, id: string): Promise<CommunityGroup> {
  if (isSmallGroups(table)) {
    const { data, error } = await supabase
      .from('small_groups')
      .select(SMALL_GROUP_COLUMNS)
      .eq('id', id)
      .single();
    if (error) throw error;
    return fromSmallGroup(data);
  }
  const { data, error } = await supabase.from('ministries').select(MINISTRY_COLUMNS).eq('id', id).single();
  if (error) throw error;
  return fromMinistry(data);
}

export const listMinistries = () => listGroups('ministries');

export const listMinistriesWithCounts = () => listGroupsWithCounts('ministries');

export async function countMinistryVolunteers(): Promise<number> {
  const { data, error } = await supabase.from('person_ministries').select('person_id');
  if (error) throw error;
  return new Set(data.map((row) => row.person_id)).size;
}

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
