// React
import { Navigate } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { UserRole } from '../types/enums';
import { AppRoute } from './paths';

interface Props {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuthCtx();

  if (loading) return null;
  if (!user) return <Navigate to={AppRoute.Login} replace />;
  // user.role is a plain string (bp-kit doesn't know about this app's UserRole enum)
  if (roles && !(roles as string[]).includes(user.role)) return <Navigate to={AppRoute.Login} replace />;

  return <>{children}</>;
}
