// React
import { useLocation, useNavigate } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { AppRoute } from '../../../routes/paths';
import { hasRole, INTEGRATION_TEAM_ROLES, LEADERSHIP_ROLES, TEACHING_ROLES, UserRole } from '../../../types/enums';

async function countMembershipPending(): Promise<number> {
  const { count, error } = await supabase
    .from('people')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'membership_pending');
  if (error) throw error;
  return count ?? 0;
}

export function useLayout() {
  const { user, logout } = useAuthCtx();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === UserRole.Admin;
  const showMembership = hasRole(user?.role, LEADERSHIP_ROLES);

  const membershipCount = useQuery(queryKeys.membershipPendingCount, countMembershipPending, { enabled: showMembership }).data ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate(AppRoute.Login);
  };

  const isActive = (path: string) => {
    const currentTop = '/' + (location.pathname.split('/').filter(Boolean)[0] ?? '');
    const targetTop = '/' + (path.split('/').filter(Boolean)[0] ?? '');
    return currentTop === targetTop;
  };

  const isExactTab = (path: string) => location.pathname === path;

  return {
    user,
    navigate,
    isAdmin,
    handleLogout,
    isActive,
    isExactTab,
    pathname: location.pathname,
    membershipCount,
    showDashboard: user?.role === UserRole.Pastor,
    showPeople: !!user,
    showVisitors: hasRole(user?.role, INTEGRATION_TEAM_ROLES),
    showCoffee: hasRole(user?.role, INTEGRATION_TEAM_ROLES),
    showClasses: hasRole(user?.role, TEACHING_ROLES),
    showMembership,
    showAdmin: showMembership,
  };
}
