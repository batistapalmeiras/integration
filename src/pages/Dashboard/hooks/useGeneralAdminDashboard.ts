// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { loadIntegrationOverview } from './integrationOverview';

export function useGeneralAdminDashboard() {
  const query = useQuery(queryKeys.generalAdminDashboard, loadIntegrationOverview);
  return { overview: query.data ?? null, loading: query.loading, error: errorMessage(query.error) };
}
