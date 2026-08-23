// Libs
import styled from 'styled-components';

export const ActionsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  > * {
    flex: 1;
    min-width: 180px;
  }
`;

export const FiltersButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const SearchRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const SectionHeading = styled.div`
  margin: ${({ theme }) => theme.spacing.xl} 0 ${({ theme }) => theme.spacing.sm};
`;

// Plain, always-a-table listing (no responsive collapse-to-card, unlike
// src/components/Table) — matches bp-cantina's Report/OrdersList table,
// which just scrolls horizontally on narrow screens instead of switching
// to a stacked-card layout.
export const PlainTableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
`;

export const PlainTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};

  thead tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
  }

  th {
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    text-align: left;
    font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.muted};
    text-transform: uppercase;
    letter-spacing: 0.4px;
    white-space: nowrap;
  }

  tbody tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
    transition: background 0.15s;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: ${({ theme }) => theme.colors.surfaceSoft};
    }
  }

  td {
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    color: ${({ theme }) => theme.colors.ink};
    vertical-align: middle;
  }
`;

// Below 743px (same "mobile" breakpoint as src/components/Table), the
// Turma column folds into a subtitle line under Nome instead of its own
// column — so the table stays at 2 visible columns (Nome+Turma, Status)
// on mobile while showing all 3 pieces of data.
export const HideOnMobile = styled.th`
  @media (max-width: 743px) {
    display: none;
  }
`;

export const NameCell = styled.div`
  display: flex;
  flex-direction: column;
`;

export const NameSubtitle = styled.span`
  display: none;
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 2px;

  @media (max-width: 743px) {
    display: block;
  }
`;

export const SummaryStrip = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 743px) {
    flex-wrap: wrap;
  }
`;

export const SummaryStat = styled.div`
  flex: 1;
  min-width: 120px;
  padding: ${({ theme }) => theme.spacing.base};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
`;

export const SummaryValue = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.displaySm.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
`;

export const SummaryLabel = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const CountBadge = styled.span<{ $eligible: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: ${({ theme }) => theme.rounded.full};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.badge.fontSize};
  font-weight: 600;
  background: ${({ theme, $eligible }) => ($eligible ? theme.colors.successSurface : theme.colors.surfaceSoft)};
  color: ${({ theme, $eligible }) => ($eligible ? theme.colors.success : theme.colors.muted)};
  border: 1px solid ${({ theme, $eligible }) => ($eligible ? theme.colors.successBorder : theme.colors.hairline)};
`;
