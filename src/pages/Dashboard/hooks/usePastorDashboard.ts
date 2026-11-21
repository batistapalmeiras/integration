// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { loadIntegrationOverview } from './integrationOverview';

export function usePastorDashboard() {
  const query = useQuery(queryKeys.pastorDashboard, loadIntegrationOverview);
  return { overview: query.data ?? null, loading: query.loading, error: errorMessage(query.error) };
}
