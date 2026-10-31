// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { fromIntegration } from '../../../domain/integrationPeople';
import { supabase } from '../../../lib/supabase';
import { PersonStatus } from '../../../types/person';
import { StatusCounts } from '../types';

export function useStatusCounts() {
  const [counts, setCounts] = useState<StatusCounts>({});
  const [totalCohorts, setTotalCohorts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: loadError } = await fromIntegration(supabase.from('people').select('status'));
    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    const nextCounts: StatusCounts = {};
    for (const row of data ?? []) {
      const status = row.status as PersonStatus;
      nextCounts[status] = (nextCounts[status] ?? 0) + 1;
    }
    setCounts(nextCounts);

    const { count: cohortsCount, error: cohortsError } = await supabase
      .from('cohorts')
      .select('id', { count: 'exact', head: true });
    if (cohortsError) {
      setError(cohortsError.message);
      setLoading(false);
      return;
    }
    setTotalCohorts(cohortsCount ?? 0);

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);

  return { counts, total, totalCohorts, loading, error };
}
