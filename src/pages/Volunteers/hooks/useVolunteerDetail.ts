// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { UserRole } from '../../../types/enums';
import { VolunteerRow } from '../types';

export function useVolunteerDetail(id: string) {
  const [volunteer, setVolunteer] = useState<VolunteerRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from('profiles')
      .select('id,name,role,active')
      .eq('id', id)
      .single();
    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setVolunteer(data as VolunteerRow);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateVolunteer = async (name: string, role: UserRole) => {
    const { error: updateError } = await supabase.from('profiles').update({ name, role }).eq('id', id);
    if (updateError) throw updateError;
    await load();
  };

  const setActive = async (active: boolean) => {
    const { error: updateError } = await supabase.from('profiles').update({ active }).eq('id', id);
    if (updateError) throw updateError;
    await load();
  };

  const removeVolunteer = async () => {
    const { data, error: invokeError } = await supabase.functions.invoke('delete-volunteer', { body: { id } });
    if (invokeError) throw invokeError;
    if (data?.error) throw new Error(data.error);
  };

  return { volunteer, loading, error, updateVolunteer, setActive, removeVolunteer };
}
