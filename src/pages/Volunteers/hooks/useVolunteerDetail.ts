// Local
import { errorMessage, invalidateQueries, setQueryData, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { UserRole } from '../../../types/enums';
import { VolunteerRow } from '../types';

const VOLUNTEER_COLUMNS = 'id,name,role,active';

async function getVolunteer(id: string): Promise<VolunteerRow> {
  const { data, error } = await supabase.from('profiles').select(VOLUNTEER_COLUMNS).eq('id', id).single();
  if (error) throw error;
  return data as VolunteerRow;
}

async function getVolunteerEmail(id: string): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke('get-volunteer-email', { body: { id } });
  if (error || data?.error) return null;
  return data?.email ?? null;
}

export function useVolunteerDetail(id: string) {
  const volunteerQuery = useQuery(queryKeys.volunteer(id), () => getVolunteer(id), { enabled: !!id });
  const emailQuery = useQuery(queryKeys.volunteerEmail(id), () => getVolunteerEmail(id), { enabled: !!id });

  const updateProfile = async (fields: Partial<Pick<VolunteerRow, 'name' | 'role' | 'active'>>) => {
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', id)
      .select(VOLUNTEER_COLUMNS)
      .single();
    if (updateError) throw updateError;
    setQueryData(queryKeys.volunteer(id), data as VolunteerRow);
    invalidateQueries(queryKeys.volunteers, { refetchActive: false });
  };

  const updateVolunteer = (name: string, role: UserRole) => updateProfile({ name, role });

  const updateEmail = async (newEmail: string) => {
    const { data, error: invokeError } = await supabase.functions.invoke('update-volunteer-email', {
      body: { id, email: newEmail },
    });
    if (invokeError) throw invokeError;
    if (data?.error) throw new Error(data.error);
    setQueryData(queryKeys.volunteerEmail(id), newEmail);
  };

  const setActive = (active: boolean) => updateProfile({ active });

  const removeVolunteer = async () => {
    const { data, error: invokeError } = await supabase.functions.invoke('delete-volunteer', { body: { id } });
    if (invokeError) throw invokeError;
    if (data?.error) throw new Error(data.error);
    await invalidateQueries(queryKeys.volunteers, { refetchActive: false });
  };

  return {
    volunteer: volunteerQuery.data ?? null,
    email: emailQuery.data ?? null,
    loading: volunteerQuery.loading || emailQuery.loading,
    error: errorMessage(volunteerQuery.error),
    updateVolunteer,
    updateEmail,
    setActive,
    removeVolunteer,
  };
}
