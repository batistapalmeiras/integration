// Libs
import { FunctionsHttpError } from '@supabase/supabase-js';
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
  origin: string;
  role: UserRole;
  membershipStatus: string | null;
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

const VOLUNTEER_COLUMNS =
  'id, role, person:people!profiles_person_id_fkey(id, name, phone, email, origin, membership_status)';

interface VolunteerRecord {
  id: string;
  role: string;
  person: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    origin: string;
    membership_status: string | null;
  } | null;
}

function toVolunteer(row: VolunteerRecord): VolunteerRow {
  return {
    id: row.id,
    personId: row.person?.id ?? '',
    name: row.person?.name ?? '',
    phone: row.person?.phone ?? null,
    email: row.person?.email ?? null,
    origin: row.person?.origin ?? '',
    role: toUserRole(row.role),
    membershipStatus: row.person?.membership_status ?? null,
  };
}

async function functionErrorMessage(error: Error): Promise<string> {
  if (!(error instanceof FunctionsHttpError)) return error.message;
  const body: unknown = await error.context.json().catch(() => null);
  const message = body && typeof body === 'object' && 'error' in body ? body.error : null;
  return typeof message === 'string' ? message : error.message;
}

async function invokeFunction<T = unknown>(name: string, body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(await functionErrorMessage(error));
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function countActiveVolunteers(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id, person:people!profiles_person_id_fkey!inner(membership_status)', { count: 'exact', head: true })
    .eq('person.membership_status', 'active');
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

export async function getVolunteerByPerson(personId: string): Promise<VolunteerRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(VOLUNTEER_COLUMNS)
    .eq('person_id', personId)
    .maybeSingle();
  if (error) throw error;
  return data ? toVolunteer(data) : null;
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

export async function updateVolunteerRole(id: string, role: UserRole): Promise<VolunteerRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select(VOLUNTEER_COLUMNS)
    .single();
  if (error) throw error;
  return toVolunteer(data);
}

export async function deleteVolunteer(id: string): Promise<void> {
  await invokeFunction('delete-volunteer', { id });
}
