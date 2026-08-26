// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { supabase } from '../../lib/supabase';

export function useMustChangePassword() {
  const { user } = useAuthCtx();
  const [mustChange, setMustChange] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!user) {
      setMustChange(false);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('profiles').select('must_change_password').eq('id', user.id).single();
    setMustChange(data?.must_change_password ?? false);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    check();
  }, [check]);

  return { mustChange, loading, recheck: check };
}
