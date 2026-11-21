// Local
import { useRole } from '../../features/access/useRole';
import { usePersonPhotoUrl } from '../../queries/memberPhotos';
import { UserRole } from '../../types/enums';
import { MemberPhoto } from '../MemberPhoto';
import { PhotoRow } from './styles';

interface Props {
  personId: string;
  size: number;
}

export function PersonPhoto({ personId, size }: Props) {
  const role = useRole();
  const url = usePersonPhotoUrl(personId, role === UserRole.GeneralAdmin).data ?? null;

  if (!url) return null;

  return (
    <PhotoRow>
      <MemberPhoto url={url} size={size} />
    </PhotoRow>
  );
}
