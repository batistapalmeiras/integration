// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { usePersonPhotoUrl } from '../../queries/memberPhotos';
import { UserRole } from '../../types/enums';
import { MemberPhoto } from '../MemberPhoto';
import { PhotoRow } from './styles';

interface Props {
  personId: string;
  size: number;
}

export function PersonPhoto({ personId, size }: Props) {
  const { user } = useAuthCtx();
  const url = usePersonPhotoUrl(personId, user?.role === UserRole.Pastor).data ?? null;

  if (!url) return null;

  return (
    <PhotoRow>
      <MemberPhoto url={url} size={size} />
    </PhotoRow>
  );
}
