// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { loadStatusCounts } from '../../../repositories/reports';

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
