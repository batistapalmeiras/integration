// Libs
import styled from 'styled-components';

export { Form } from 'bp-kit';

export const PaginationWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export const SearchRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const SelectorRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const CountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
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

export const LessonTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: ${({ theme }) => theme.spacing.base};
`;

export const LessonTab = styled.button<{ $selected: boolean }>`
  min-height: 56px;
  border-radius: ${({ theme }) => theme.rounded.md};
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.colors.ink : theme.colors.borderStrong)};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.ink : theme.colors.canvas)};
  color: ${({ theme, $selected }) => ($selected ? theme.colors.onDark : theme.colors.ink)};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;

  strong {
    font-size: 14px;
  }

  span {
    font-size: 12px;
  }
`;

export const PresenceHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};

  h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.ink};
  }

  span {
    font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.success};
  }
`;

export const PresenceBar = styled.div<{ $percent: number }>`
  height: 6px;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.hairlineSoft};
  margin-bottom: ${({ theme }) => theme.spacing.base};
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $percent }) => $percent}%;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: inherit;
  }
`;

export const StudentList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  overflow: hidden;

  li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
  }
`;

export const StudentToggle = styled.div<{ $checked: boolean }>`
  background: ${({ theme, $checked }) => ($checked ? theme.colors.primarySoft : theme.colors.canvas)};

  & > label {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    gap: ${({ theme }) => theme.spacing.md};
    min-height: 60px;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
  }
`;

export const StudentText = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ink};
  }

  span {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

export const FootHint = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;

export const GridWrap = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  overflow-x: auto;
`;

export const Grid = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;

  th,
  td {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
  }

  thead th {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.muted};
    border-bottom-color: ${({ theme }) => theme.colors.hairline};
  }

  tbody th {
    text-align: left;
    font-weight: 600;
    white-space: nowrap;
  }

  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: none;
  }
`;

export const LessonHead = styled.th`
  text-align: center;

  span {
    display: block;
    font-weight: 400;
  }
`;

export const CheckCell = styled.td`
  text-align: center;

  label {
    justify-content: center;
  }
`;

export const StudentLink = styled.button`
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
  text-align: left;
`;

export const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const SummaryCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing.base};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.body};
`;

export const SummaryValue = styled.span<{ $tone?: 'success' | 'warning' }>`
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme, $tone }) =>
    $tone === 'success' ? theme.colors.success : $tone === 'warning' ? theme.colors.warning : theme.colors.ink};
`;
