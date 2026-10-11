// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { UserRole } from '../../../types/enums';
import { CREATE_VOLUNTEER_FUNCTION, getDefaultVolunteerPassword } from '../domain';
import { VolunteerRow } from '../types';

export function useVolunteers() {
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase.from('profiles').select('id,name,role,active').order('name');
    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setVolunteers((data ?? []) as VolunteerRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addVolunteer = async (email: string, name: string, role: UserRole) => {
    const { data, error: invokeError } = await supabase.functions.invoke(CREATE_VOLUNTEER_FUNCTION, {
      body: { email, password: getDefaultVolunteerPassword(), name, role },
    });
    if (invokeError) throw invokeError;
    if (data?.error) throw new Error(data.error);
    await load();
  };

  return { volunteers, loading, error, addVolunteer };
}
