// Libs
import { useNavigate } from 'react-router-dom';
import { ProfilePage as SharedProfilePage, useAuthCtx } from 'bp-kit';
// Local
import { AppRoute } from '../../routes/paths';
import { ROLE_LABELS, UserRole } from '../../types/enums';

export function ProfilePage() {
  const { user, logout } = useAuthCtx();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(AppRoute.Login);
  };

  return (
    <SharedProfilePage
      roleLabel={user ? ROLE_LABELS[user.role as UserRole] : undefined}
      changePasswordPath={AppRoute.ChangePassword}
      onLogout={handleLogout}
    />
  );
}
