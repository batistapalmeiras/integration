// Local
import { countIntegrationPeopleByStatus } from '../../../domain/integrationPeople';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { StatusCounts } from '../types';

async function loadStatusCounts(): Promise<{ counts: StatusCounts; totalCohorts: number }> {
  const [counts, cohortsResult] = await Promise.all([
    countIntegrationPeopleByStatus(),
    supabase.from('cohorts').select('id', { count: 'exact', head: true }),
  ]);
  if (cohortsResult.error) throw cohortsResult.error;
  return { counts, totalCohorts: cohortsResult.count ?? 0 };
}

export function useStatusCounts() {
  const query = useQuery(queryKeys.statusCounts, loadStatusCounts);
  const counts = query.data?.counts ?? {};
  const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);

  return {
    counts,
    total,
    totalCohorts: query.data?.totalCohorts ?? 0,
    loading: query.loading,
    error: errorMessage(query.error),
  };
}
