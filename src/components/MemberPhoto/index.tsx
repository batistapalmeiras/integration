// React
import { ReactNode } from 'react';
// Libs
import { UserRound } from 'lucide-react';
// Local
import { Circle, NameText, PhotoImage, PhotoNameRow } from './styles';

interface Props {
  url: string | null;
  size: number;
}

export function MemberPhoto({ url, size }: Props) {
  return (
    <Circle $size={size}>
      {url ? <PhotoImage src={url} alt="" /> : <UserRound size={Math.round(size * 0.45)} aria-hidden="true" />}
    </Circle>
  );
}

const LIST_PHOTO_SIZE = 48;

export function PhotoName({ url, children }: { url: string | null; children: ReactNode }) {
  return (
    <PhotoNameRow>
      <MemberPhoto url={url} size={LIST_PHOTO_SIZE} />
      <NameText>{children}</NameText>
    </PhotoNameRow>
  );
}
