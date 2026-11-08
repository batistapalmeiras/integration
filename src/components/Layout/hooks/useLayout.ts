// React
import { useLocation, useNavigate } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { AppRoute } from '../../../routes/paths';
import { hasRole, LEADERSHIP_ROLES } from '../../../types/enums';
import { countMembershipPending } from '../../../repositories/membership';

export function useLayout() {
  const { user, logout } = useAuthCtx();
  const location = useLocation();
  const navigate = useNavigate();

  const showMembership = hasRole(user?.role, LEADERSHIP_ROLES);

  const membershipCount =
    useQuery(queryKeys.membershipPendingCount, countMembershipPending, { enabled: showMembership }).data ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate(AppRoute.Login);
  };

  const isExactTab = (path: string) => location.pathname === path;

  return {
    user,
    navigate,
    handleLogout,
    isExactTab,
    pathname: location.pathname,
    membershipCount,
  };
}
