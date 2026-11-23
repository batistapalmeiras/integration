// React
import { useLocation } from 'react-router-dom';
// Local
import { useCanAccess } from '../../../features/access/useRole';
import { useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { useOverdueConsolidationCount } from '../../../queries/consolidations';
import { AppRoute } from '../../../routes/paths';
import { countMembershipPending } from '../../../repositories/membership';

export function useLayout() {
  const location = useLocation();

  const canAccess = useCanAccess();
  const showMembership = canAccess(AppRoute.Membership);

  const membershipCount =
    useQuery(queryKeys.membershipPendingCount, countMembershipPending, { enabled: showMembership }).data ?? 0;

  const consolidationOverdueCount = useOverdueConsolidationCount(canAccess(AppRoute.Consolidation));

  const navCountFor = (path: string): number => {
    if (path === AppRoute.Membership) return membershipCount;
    if (path === AppRoute.Consolidation) return consolidationOverdueCount;
    return 0;
  };

  const isExactTab = (path: string) => location.pathname === path;

  return {
    isExactTab,
    pathname: location.pathname,
    search: location.search,
    navCountFor,
  };
}
