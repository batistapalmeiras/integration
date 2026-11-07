// React
import { useEffect, useRef } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { clearQueries } from '../../lib/queryCache';

export function QueryCacheReset() {
  const { user } = useAuthCtx();
  const userId = user?.id ?? null;
  const previousUserId = useRef(userId);

  useEffect(() => {
    if (previousUserId.current && previousUserId.current !== userId) clearQueries();
    previousUserId.current = userId;
  }, [userId]);

  return null;
}
