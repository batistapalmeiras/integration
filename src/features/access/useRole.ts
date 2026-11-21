// React
import { useLocation } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { resolveRole } from '../../domain/access';
import { canAccess, moduleOf } from '../../routes/table';
import { navAreasFor } from '../../routes/navigation';
import { useViewRole } from './viewRole';

export function useRole(): string | undefined {
  const { user } = useAuthCtx();
  const { pathname } = useLocation();
  return resolveRole(user?.role, moduleOf(pathname), useViewRole());
}

export function useNavAreas() {
  const { user } = useAuthCtx();
  return navAreasFor(user?.role, useViewRole());
}

export function useCanAccess(): (pathname: string) => boolean {
  const { user } = useAuthCtx();
  const viewRole = useViewRole();
  return (pathname) => canAccess(resolveRole(user?.role, moduleOf(pathname), viewRole), pathname);
}
