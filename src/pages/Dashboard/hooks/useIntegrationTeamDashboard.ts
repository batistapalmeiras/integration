// Local
import { getUpcomingCoffeeRoster } from '../../../domain/cafeSchedule';
import { countIntegrationPeopleByStatus, countIntegrationPeopleCreatedSince } from '../../../domain/integrationPeople';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { UpcomingCoffee } from '../components/AgendaPanel';
import { FunnelCounts } from '../components/FunnelSection';

const NEW_PEOPLE_WINDOW_DAYS = 7;

interface Overview {
  funnel: FunnelCounts;
  newThisWeek: number;
  coffee: UpcomingCoffee | null;
}

async function loadOverview(): Promise<Overview> {
  const since = new Date(Date.now() - NEW_PEOPLE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const [funnel, newThisWeek, coffee] = await Promise.all([
    countIntegrationPeopleByStatus(),
    countIntegrationPeopleCreatedSince(since),
    getUpcomingCoffeeRoster(),
  ]);
  return { funnel, newThisWeek, coffee };
}

export function useIntegrationTeamDashboard() {
  const query = useQuery(queryKeys.integrationTeamDashboard, loadOverview);
  return { overview: query.data ?? null, loading: query.loading, error: errorMessage(query.error) };
}
