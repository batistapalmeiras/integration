// React
import { Navigate } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { profilePath } from '../../routes/paths';

export function OwnProfileRedirect() {
  const { user } = useAuthCtx();
  if (!user) return null;
  return <Navigate to={profilePath(user.id)} replace />;
}
