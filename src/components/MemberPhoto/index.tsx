// React
import { ReactNode } from 'react';
// Libs
import { UserRound } from 'lucide-react';
// Local
import { Circle, NameText, PhotoImage, PhotoNameRow, Square } from './styles';

export { SQUARE_PHOTO_RADIUS } from './styles';

interface Props {
  url: string | null;
  size: number;
  shape?: 'circle' | 'square';
  interactive?: boolean;
  fluid?: boolean;
}

export function MemberPhoto({ url, size, shape = 'circle', interactive = false, fluid = false }: Props) {
  const content = url ? <PhotoImage src={url} alt="" /> : <UserRound size={Math.round(size * 0.35)} aria-hidden="true" />;
  return shape === 'square' ? (
    <Square $size={size} $interactive={interactive} $fluid={fluid}>
      {content}
    </Square>
  ) : (
    <Circle $size={size}>{content}</Circle>
  );
}

export const MEMBER_PHOTO_SIZE = 120;

const LIST_PHOTO_SIZE = 48;

export function PhotoName({ url, children }: { url: string | null; children: ReactNode }) {
  return (
    <PhotoNameRow>
      <MemberPhoto url={url} size={LIST_PHOTO_SIZE} />
      <NameText>{children}</NameText>
    </PhotoNameRow>
  );
}
