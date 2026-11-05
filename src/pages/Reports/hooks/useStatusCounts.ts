// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { countIntegrationPeopleByStatus } from '../../../domain/integrationPeople';
import { supabase } from '../../../lib/supabase';
import { StatusCounts } from '../types';

export function useStatusCounts() {
  const [counts, setCounts] = useState<StatusCounts>({});
  const [totalCohorts, setTotalCohorts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setCounts(await countIntegrationPeopleByStatus());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
      return;
    }

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
