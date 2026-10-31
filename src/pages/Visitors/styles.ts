// Libs
import styled from 'styled-components';

export const PaginationWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

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

export const Split = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const ListColumn = styled.div`
  flex: 999 1 420px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const PreviewColumn = styled.aside`
  flex: 1 1 360px;
  max-width: 100%;
  position: sticky;
  top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
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

export const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;
