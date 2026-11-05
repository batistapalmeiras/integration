// React
import { Navigate } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { UserRole } from '../types/enums';
import { AppRoute } from './paths';

export function homeRouteFor(role: string | undefined): AppRoute {
  if (role === UserRole.Pastor) return AppRoute.Dashboard;
  if (role === UserRole.Admin) return AppRoute.Admin;
  if (role === UserRole.Teacher) return AppRoute.Classes;
  return AppRoute.Visitors;
}

export function HomeRedirect() {
  const { user } = useAuthCtx();
  return <Navigate to={homeRouteFor(user?.role)} replace />;
}
