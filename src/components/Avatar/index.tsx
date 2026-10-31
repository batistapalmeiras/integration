// Libs
import styled from 'styled-components';

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
`;

interface Props {
  name: string;
  size?: number;
  muted?: boolean;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 40, muted }: Props) {
  return (
    <Circle aria-hidden="true" $size={size} $muted={muted}>
      {initials(name)}
    </Circle>
  );
}
