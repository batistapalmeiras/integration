// React
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { supabase } from '../../../lib/supabase';
import { AppRoute } from '../../../routes/paths';
import { hasRole, INTEGRATION_TEAM_ROLES, LEADERSHIP_ROLES, TEACHING_ROLES, UserRole } from '../../../types/enums';

export function useLayout() {
  const { user, logout } = useAuthCtx();
  const location = useLocation();
  const navigate = useNavigate();
  const [membershipCount, setMembershipCount] = useState(0);

  const isAdmin = user?.role === UserRole.Admin;
  const showMembership = hasRole(user?.role, LEADERSHIP_ROLES);

  useEffect(() => {
    if (!showMembership) return;
    supabase
      .from('people')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'membership_pending')
      .then(({ count }) => setMembershipCount(count ?? 0));
  }, [showMembership, location.pathname]);

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
    membershipCount,
    showPeople: !!user,
    showVisitors: hasRole(user?.role, INTEGRATION_TEAM_ROLES),
    showCoffee: hasRole(user?.role, INTEGRATION_TEAM_ROLES),
    showClasses: hasRole(user?.role, TEACHING_ROLES),
    showMembership,
    showAdmin: showMembership,
  };
}
