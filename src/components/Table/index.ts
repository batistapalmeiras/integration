// Libs
import styled from 'styled-components';

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    border: none;
    border-radius: 0;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${({ theme }) => theme.typography.fontFamily};
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

export const Th = styled.th<{ $hideOnMobile?: boolean; $shrink?: boolean }>`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
  white-space: nowrap;

  ${({ $hideOnMobile, theme }) =>
    $hideOnMobile &&
    `
      @media (max-width: ${theme.breakpoints.mobile}) {
        display: none;
      }
    `}

  ${({ $shrink }) => $shrink && `width: 1%;`}
`;

export const Td = styled.td<{ $hideOnMobile?: boolean; $truncate?: boolean; $shrink?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.ink};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
  vertical-align: middle;

  ${({ $hideOnMobile, theme }) =>
    $hideOnMobile &&
    `
      @media (max-width: ${theme.breakpoints.mobile}) {
        display: none;
      }
    `}

  ${({ $truncate }) =>
    $truncate &&
    `
      max-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}

  ${({ $shrink }) =>
    $shrink &&
    `
      width: 1%;
      white-space: nowrap;
    `}
`;

export const RowActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
`;
