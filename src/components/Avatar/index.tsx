// Libs
import styled from 'styled-components';
// Local
import { initialsOf } from '../../domain/text';

const Circle = styled.span<{ $size: number; $muted?: boolean }>`
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ theme }) => theme.rounded.full};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ $size }) => Math.round($size * 0.35)}px;
  font-weight: 700;
  background: ${({ theme, $muted }) => ($muted ? theme.colors.surfaceStrong : theme.colors.primarySoft)};
  color: ${({ theme, $muted }) => ($muted ? theme.colors.body : theme.colors.luxe)};
  overflow: hidden;
`;

const Photo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

interface Props {
  name: string;
  size?: number;
  muted?: boolean;
  photoUrl?: string | null;
}

export function Avatar({ name, size = 40, muted, photoUrl }: Props) {
  return (
    <Circle aria-hidden="true" $size={size} $muted={muted}>
      {photoUrl ? <Photo src={photoUrl} alt="" /> : initialsOf(name)}
    </Circle>
  );
}
