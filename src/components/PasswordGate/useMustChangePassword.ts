// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { getMustChangePassword } from '../../repositories/profiles';

export function useMustChangePassword() {
  const { user } = useAuthCtx();
  const userId = user?.id;
  const [mustChange, setMustChange] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!userId) {
      setMustChange(false);
      setLoading(false);
      return;
    }
    setMustChange(await getMustChangePassword(userId).catch(() => false));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    check();
  }, [check]);

  return { mustChange, loading, recheck: check };
}
