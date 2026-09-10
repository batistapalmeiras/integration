// React
import { useLocation, useNavigate } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { AppRoute } from '../../../routes/paths';
import { UserRole } from '../../../types/enums';

export function useLayout() {
  const { user, logout } = useAuthCtx();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === UserRole.Admin;
  const isPastor = user?.role === UserRole.Pastor;

  const handleLogout = async () => {
    await logout();
    navigate(AppRoute.Login);
  };

  const isActive = (path: string) => {
    const currentTop = '/' + (location.pathname.split('/').filter(Boolean)[0] ?? '');
    const targetTop = '/' + (path.split('/').filter(Boolean)[0] ?? '');
    return currentTop === targetTop;
  };

  // Stricter than isActive (which matches the whole /visitantes/* section,
  // used for sidebar highlighting) — this only matches the tab's own list
  // route exactly, so a drill-down page (e.g. /visitantes/:id, with its own
  // back arrow) doesn't count as "on that tab" for bottom-bar visibility.
  const isExactTab = (path: string) => location.pathname === path;

  return {
    user,
    navigate,
    isAdmin,
    handleLogout,
    isActive,
    isExactTab,
    showPeople: !!user,
    showVisitors: isAdmin || isPastor || user?.role === UserRole.IntegrationTeam,
    showCoffee: isAdmin || isPastor || user?.role === UserRole.IntegrationTeam,
    showClasses: isAdmin || isPastor || user?.role === UserRole.Teacher,
    showAdmin: isAdmin || isPastor,
  };
}
