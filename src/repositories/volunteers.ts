// Local
import { byName } from '../domain/text';
import { supabase } from '../lib/supabase';
import { toUserRole, UserRole } from '../types/enums';

export interface VolunteerRow {
  id: string;
  personId: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  active: boolean;
}

export interface VolunteerCandidate {
  id: string;
  name: string;
  email: string | null;
}

export interface NewVolunteer {
  personId: string;
  password: string;
  role: UserRole;
}

const VOLUNTEER_COLUMNS = 'id, role, active, person:people!profiles_person_id_fkey(id, name, phone, email)';

interface VolunteerRecord {
  id: string;
  role: string;
  active: boolean;
  person: { id: string; name: string; phone: string | null; email: string | null } | null;
}

function toVolunteer(row: VolunteerRecord): VolunteerRow {
  return {
    id: row.id,
    personId: row.person?.id ?? '',
    name: row.person?.name ?? '',
    phone: row.person?.phone ?? null,
    email: row.person?.email ?? null,
    role: toUserRole(row.role),
    active: row.active,
  };
}

async function invokeFunction<T = unknown>(name: string, body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function countActiveVolunteers(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('active', true);
  if (error) throw error;
  return count ?? 0;
}

export async function listVolunteers(): Promise<VolunteerRow[]> {
  const { data, error } = await supabase.from('profiles').select(VOLUNTEER_COLUMNS);
  if (error) throw error;
  return (data ?? []).map(toVolunteer).sort(byName);
}

export async function getVolunteer(id: string): Promise<VolunteerRow> {
  const { data, error } = await supabase.from('profiles').select(VOLUNTEER_COLUMNS).eq('id', id).single();
  if (error) throw error;
  return toVolunteer(data);
}

export async function listVolunteerCandidates(): Promise<VolunteerCandidate[]> {
  const [people, profiles] = await Promise.all([
    supabase.from('people').select('id, name, email').eq('status', 'member'),
    supabase.from('profiles').select('person_id'),
  ]);
  const failure = people.error ?? profiles.error;
  if (failure) throw failure;
  const linked = new Set((profiles.data ?? []).map((row) => row.person_id));
  return (people.data ?? []).filter((person) => !linked.has(person.id)).sort(byName);
}

export async function createVolunteer(volunteer: NewVolunteer): Promise<void> {
  await invokeFunction('create-volunteer', volunteer);
}

export async function updateVolunteer(
  id: string,
  fields: Partial<Pick<VolunteerRow, 'role' | 'active'>>,
): Promise<VolunteerRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', id)
    .select(VOLUNTEER_COLUMNS)
    .single();
  if (error) throw error;
  return toVolunteer(data);
}

export interface VolunteerIdentity {
  name: string;
  email: string;
  phone: string;
}

export async function updateVolunteerIdentity(id: string, identity: VolunteerIdentity): Promise<void> {
  const { error } = await supabase.rpc('update_volunteer_identity', {
    p_profile_id: id,
    p_name: identity.name,
    p_email: identity.email,
    p_phone: identity.phone,
  });
  if (error) throw error;
}

export async function deleteVolunteer(id: string): Promise<void> {
  await invokeFunction('delete-volunteer', { id });
}
