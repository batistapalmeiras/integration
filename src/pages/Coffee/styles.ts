// Libs
import { Typography } from 'bp-kit';
import styled from 'styled-components';

export const RoundButton = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.rounded.full};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.canvas};
  color: ${({ theme }) => theme.colors.ink};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const EventSwitcher = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 6px;
  border-radius: ${({ theme }) => theme.rounded.md};
  background: ${({ theme }) => theme.colors.surfaceStrong};
  margin-bottom: ${({ theme }) => theme.spacing.base};
`;

export const SwitchArrow = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    color: ${({ theme }) => theme.colors.borderStrong};
    cursor: default;
  }
`;

export const EventLabel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

export const SearchRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.base};
`;

export const ListTitle = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const PersonList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  overflow: hidden;
`;

export const PersonItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.base};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
  }
`;

export const PersonTop = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
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

export const AddButton = styled.button`
  width: 100%;
  min-height: 48px;
  margin-top: ${({ theme }) => theme.spacing.base};
  border: 1px dashed ${({ theme }) => theme.colors.mutedSoft};
  border-radius: ${({ theme }) => theme.rounded.md};
  background: ${({ theme }) => theme.colors.canvas};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
`;

export const SheetActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
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
