// React
import { useEffect, useRef, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === UserRole.Admin;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate(AppRoute.Login);
  };

  const isActive = (path: string) => {
    const currentTop = '/' + (location.pathname.split('/').filter(Boolean)[0] ?? '');
    const targetTop = '/' + (path.split('/').filter(Boolean)[0] ?? '');
    return currentTop === targetTop;
  };

  return {
    user,
    navigate,
    open,
    setOpen,
    ref,
    isAdmin,
    handleLogout,
    isActive,
    showPeople: !!user,
    showVisitors: isAdmin || user?.role === UserRole.Reception || user?.role === UserRole.IntegrationTeam,
    showCoffee: isAdmin || user?.role === UserRole.Pastor || user?.role === UserRole.IntegrationTeam,
    showClasses: isAdmin || user?.role === UserRole.Teacher,
    showAdmin: isAdmin || user?.role === UserRole.Pastor,
    showReports: isAdmin,
  };
}
