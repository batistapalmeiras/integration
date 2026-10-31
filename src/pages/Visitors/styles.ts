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

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
`;

export const SectionCount = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const RowList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  overflow: hidden;
`;

export const Row = styled.li<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 64px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.sm}
    ${({ theme }) => theme.spacing.base};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.primarySoft : theme.colors.canvas)};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
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
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const RowName = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RowReason = styled.span<{ $tone: 'info' | 'warning' | 'muted' }>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme, $tone }) =>
    $tone === 'info' ? theme.colors.info : $tone === 'warning' ? theme.colors.warning : theme.colors.muted};
`;

export const WhatsAppButton = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.rounded.full};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryActive};
  }
`;

export const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const PreviewName = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.displaySm.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
`;
