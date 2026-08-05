// Libs
import { ProfilePage as SharedProfilePage, useAuthCtx } from 'bp-kit';
// Local
import { ROLE_LABELS, UserRole } from '../../types/enums';

export function ProfilePage() {
  const { user } = useAuthCtx();
  return <SharedProfilePage roleLabel={user ? ROLE_LABELS[user.role as UserRole] : undefined} />;
}
