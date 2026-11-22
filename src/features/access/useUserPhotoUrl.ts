// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { usePersonPhotoUrl } from '../../queries/memberPhotos';
import { useOwnPersonId } from '../../queries/person';
import { hasRole, MEMBER_RECORD_ROLES } from '../../types/enums';

export function useUserPhotoUrl(): string | null {
  const { user } = useAuthCtx();
  const canSeePhotos = hasRole(user?.role, MEMBER_RECORD_ROLES);
  const personId = useOwnPersonId(user?.id ?? '', canSeePhotos).data ?? '';
  return usePersonPhotoUrl(personId, canSeePhotos).data ?? null;
}
