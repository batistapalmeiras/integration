// Libs
import { UserRound } from 'lucide-react';
// Local
import { Circle, PhotoImage } from './styles';

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
