// Libs
import styled from 'styled-components';

export const SearchRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const QueueChips = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  & > * {
    flex-shrink: 0;
    white-space: nowrap;
  }
`;

export const RowButton = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
`;

export const RowText = styled.span`
  flex: 1;
  min-width: 0;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.ink};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ArchivedLink = styled.button`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border: 0;
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
`;
