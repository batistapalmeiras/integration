// Libs
import styled from 'styled-components';

export const TableWrapper = styled.div`
  width: 100%;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${({ theme }) => theme.typography.fontFamily};

  @media (max-width: 743px) {
    display: block;

    thead {
      display: none;
    }

    tbody {
      display: flex;
      flex-direction: column;
      gap: ${({ theme }) => theme.spacing.sm};
    }

    tr {
      display: block;
      border: 1px solid ${({ theme }) => theme.colors.hairline};
      border-radius: ${({ theme }) => theme.rounded.md};
      padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    }
  }
`;

export const Tr = styled.tr<{ $clickable?: boolean }>`
  ${({ $clickable, theme }) =>
    $clickable &&
    `
      cursor: pointer;
      transition: background 0.15s ease;

      &:hover {
        background: ${theme.colors.surfaceSoft};
      }
    `}
`;

export const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
`;

export const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.ink};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
  vertical-align: middle;

  @media (max-width: 743px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.xs} 0;
    border-bottom: none;
    text-align: right;

    &::before {
      content: attr(data-label);
      flex-shrink: 0;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.muted};
      text-align: left;
    }

    &:not(:last-child) {
      border-bottom: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
    }
  }
`;

export const RowActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 743px) {
    justify-content: flex-end;
    width: 100%;
  }
`;
