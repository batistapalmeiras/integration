// Libs
import styled, { css } from 'styled-components';

export const Circle = styled.span<{ $size: number }>`
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ theme }) => theme.rounded.full};
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.mutedSoft};
`;

export const SQUARE_PHOTO_RADIUS = '14px';

export const Square = styled.span<{ $size: number; $interactive: boolean; $fluid: boolean }>`
  flex-shrink: 0;
  width: ${({ $size, $fluid }) => ($fluid ? '100%' : `${$size}px`)};
  max-width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: ${SQUARE_PHOTO_RADIUS};
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.mutedSoft};

  img {
    transition: transform 0.3s ease;
  }

  ${({ $interactive }) =>
    $interactive &&
    css`
      &:hover img {
        transform: scale(1.06);
      }
    `}
`;

export const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const PhotoNameRow = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`;

export const NameText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
