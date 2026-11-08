// Local
import { errorMessage, invalidateQueries, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { UserRole } from '../../../types/enums';
import { CREATE_VOLUNTEER_FUNCTION, getDefaultVolunteerPassword } from '../domain';
import { VolunteerRow } from '../types';

async function listVolunteers(): Promise<VolunteerRow[]> {
  const { data, error } = await supabase.from('profiles').select('id,name,role,active').order('name');
  if (error) throw error;
  return (data ?? []) as VolunteerRow[];
}

export function useVolunteers() {
  const query = useQuery(queryKeys.volunteers, listVolunteers);

  const addVolunteer = async (email: string, name: string, role: UserRole) => {
    const { data, error: invokeError } = await supabase.functions.invoke(CREATE_VOLUNTEER_FUNCTION, {
      body: { email, password: getDefaultVolunteerPassword(), name, role },
    });
    if (invokeError) throw invokeError;
    if (data?.error) throw new Error(data.error);
    await invalidateQueries(queryKeys.volunteers);
  };

  const changeRole = async (id: string, role: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) throw error;
    await Promise.all([
      invalidateQueries(queryKeys.volunteers),
      invalidateQueries(queryKeys.volunteer(id), { refetchActive: false }),
    ]);
  };

  return {
    volunteers: query.data ?? [],
    loading: query.loading,
    error: errorMessage(query.error),
    addVolunteer,
    changeRole,
  };
}
