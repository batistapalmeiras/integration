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
  min-height: 60px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
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
