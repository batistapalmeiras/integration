// Local
import { CommunityOverview, getCommunityOverview } from '../../../domain/communityGroups';
import { countMembers } from '../../../domain/memberRecords';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { IntegrationOverview, loadIntegrationOverview } from './integrationOverview';

interface Overview extends IntegrationOverview {
  totalMembers: number;
  community: CommunityOverview;
}

async function loadOverview(): Promise<Overview> {
  const [integration, totalMembers, community] = await Promise.all([
    loadIntegrationOverview(),
    countMembers(),
    getCommunityOverview(),
  ]);
  return { ...integration, totalMembers, community };
}

export function usePastorDashboard() {
  const query = useQuery(queryKeys.pastorDashboard, loadOverview);
  return { overview: query.data ?? null, loading: query.loading, error: errorMessage(query.error) };
}
