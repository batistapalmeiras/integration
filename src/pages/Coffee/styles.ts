// Libs
import { Typography } from 'bp-kit';
import styled from 'styled-components';

export const SearchRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.base};
`;

export const ListTitle = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const PersonLink = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
`;

export const IconAction = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const Segmented = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 4px;
  border-radius: ${({ theme }) => theme.rounded.md};
  background: ${({ theme }) => theme.colors.surfaceStrong};
`;

export const SegmentButton = styled.button<{ $tone: 'positive' | 'negative' }>`
  height: 44px;
  border: none;
  border-radius: 9px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  color: ${({ theme }) => theme.colors.body};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.canvas};
    color: ${({ theme, $tone }) => ($tone === 'positive' ? theme.colors.luxe : theme.colors.primaryErrorText)};
  }
`;

export const PaginationWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export const Hint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;
