// React
import { Navigate } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { ViewRoleForm } from './components/ViewRoleForm';

export function ViewRolePage() {
  const { user } = useAuthCtx();
  if (user?.role !== UserRole.Developer) return <Navigate to={AppRoute.Profile} replace />;
  return <ViewRoleForm />;
}
