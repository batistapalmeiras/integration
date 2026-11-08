// Local
import { countActiveVolunteers } from '../../../repositories/volunteers';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { IntegrationOverview, loadIntegrationOverview } from './integrationOverview';

interface Overview extends IntegrationOverview {
  volunteers: number;
}

async function loadOverview(): Promise<Overview> {
  const [integration, volunteers] = await Promise.all([loadIntegrationOverview(), countActiveVolunteers()]);
  return { ...integration, volunteers };
}

export function useAdminDashboard() {
  const query = useQuery(queryKeys.adminDashboard, loadOverview);
  return { overview: query.data ?? null, loading: query.loading, error: errorMessage(query.error) };
}
