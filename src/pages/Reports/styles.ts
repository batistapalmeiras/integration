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

export const SearchRow = styled.div``;

// Fills the remaining viewport (header/bottom-bar/page-padding subtracted)
// so a short, paginated list still gets its pagination pinned near the
// bottom of the screen instead of floating right under a handful of rows.
export const PageFlexWrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px - 56px - env(safe-area-inset-bottom) - ${({ theme }) => theme.spacing.sm} - ${({ theme }) => theme.spacing.lg});

  @media (min-width: 745px) {
    min-height: calc(100vh - ${({ theme }) => theme.spacing.xl} - ${({ theme }) => theme.spacing.xl});
  }
`;

export const PageFlexBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const PaginationWrap = styled.div`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

export const SectionHeading = styled.div`
  margin: ${({ theme }) => theme.spacing.xl} 0 ${({ theme }) => theme.spacing.sm};
`;

export const NameCell = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const NamePrimary = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Mirrors Th/Td's $hideOnMobile breakpoint — when the Presenças column hides
// on mobile, this subtitle line under Nome is what shows that count instead.
export const NameSubtitle = styled.span`
  display: none;
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 2px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
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
