// React
import { useNavigate } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { AppRoute } from '../../routes/paths';

export function useLogout(): () => Promise<void> {
  const { logout } = useAuthCtx();
  const navigate = useNavigate();

  return async () => {
    await logout();
    navigate(AppRoute.Login);
  };
}
