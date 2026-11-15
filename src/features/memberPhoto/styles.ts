// Libs
import styled from 'styled-components';

export const CropViewport = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  margin: ${({ theme }) => theme.spacing.base} auto 0;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: ${({ theme }) => theme.colors.ink};
  touch-action: none;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
`;

export const CropImage = styled.img.attrs<{ $width: number; $height: number; $x: number; $y: number }>(
  ({ $width, $height, $x, $y }) => ({
    style: { width: `${$width}px`, height: `${$height}px`, transform: `translate(${$x}px, ${$y}px)` },
  }),
)<{ $width: number; $height: number; $x: number; $y: number }>`
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  pointer-events: none;
`;

export const CropMask = styled.div`
  position: absolute;
  inset: 0;
  border-radius: ${({ theme }) => theme.rounded.full};
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
`;

export const ZoomRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: 280px;
  margin: ${({ theme }) => theme.spacing.base} auto 0;
  color: ${({ theme }) => theme.colors.muted};
`;

export const ZoomRange = styled.input`
  flex: 1;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

export const FramedCircle = styled.span<{ $size: number }>`
  position: relative;
  flex-shrink: 0;
  display: inline-block;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.surfaceSoft};
`;
