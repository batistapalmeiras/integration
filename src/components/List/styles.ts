// Libs
import styled from 'styled-components';

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  overflow: hidden;
`;

export const ListItem = styled.li<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.primarySoft : theme.colors.canvas)};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
  }
`;

export const ListItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ChevronMark = styled.span`
  display: flex;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.mutedSoft};
`;

export const ChevronButton = styled.button`
  display: flex;
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.mutedSoft};
  cursor: pointer;
`;

export const ListHeader = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
  color: ${({ theme }) => theme.colors.muted};
`;

export const ListGrow = styled.span`
  flex: 1;
  min-width: 0;
`;

export const ListStatusCell = styled.span`
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  width: 136px;
`;

export const ListSlot = styled.span<{ $width: number }>`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: ${({ $width }) => $width}px;
`;

export const ListName = styled.span`
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
