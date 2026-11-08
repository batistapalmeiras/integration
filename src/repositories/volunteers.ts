// Local
import { supabase } from '../lib/supabase';
import { UserRole } from '../types/enums';

export interface VolunteerRow {
  id: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export interface NewVolunteer {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const VOLUNTEER_COLUMNS = 'id,name,role,active';

async function invokeFunction<T = unknown>(name: string, body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
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
  const { data, error } = await supabase.from('profiles').select(VOLUNTEER_COLUMNS).order('name');
  if (error) throw error;
  return (data ?? []) as VolunteerRow[];
}

export async function getVolunteer(id: string): Promise<VolunteerRow> {
  const { data, error } = await supabase.from('profiles').select(VOLUNTEER_COLUMNS).eq('id', id).single();
  if (error) throw error;
  return data as VolunteerRow;
}

export async function getVolunteerEmail(id: string): Promise<string | null> {
  try {
    const data = await invokeFunction<{ email?: string }>('get-volunteer-email', { id });
    return data?.email ?? null;
  } catch {
    return null;
  }
}

export async function createVolunteer(volunteer: NewVolunteer): Promise<void> {
  await invokeFunction('create-volunteer', volunteer);
}

export async function updateVolunteer(
  id: string,
  fields: Partial<Pick<VolunteerRow, 'name' | 'role' | 'active'>>,
): Promise<VolunteerRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', id)
    .select(VOLUNTEER_COLUMNS)
    .single();
  if (error) throw error;
  return data as VolunteerRow;
}

export async function updateVolunteerEmail(id: string, email: string): Promise<void> {
  await invokeFunction('update-volunteer-email', { id, email });
}

export async function deleteVolunteer(id: string): Promise<void> {
  await invokeFunction('delete-volunteer', { id });
}
