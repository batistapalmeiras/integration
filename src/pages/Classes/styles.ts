// Libs
import { StatsGrid, Typography } from 'bp-kit';
import styled from 'styled-components';
// Local
import { Table, Td, Th } from '../../components/Table';

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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;

  & > * {
    color: ${({ theme, $selected }) => ($selected ? theme.colors.onDark : theme.colors.ink)};
  }
`;

export const PresenceHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
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
`;

export const FootHint = styled(Typography)`
  margin-top: ${({ theme }) => theme.spacing.sm};
  text-align: center;
`;

export const Grid = styled(Table)`
  min-width: 760px;

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

export const LessonHead = styled(Th)`
  text-align: center;

  span {
    display: block;
  }
`;

export const CheckCell = styled(Td)`
  text-align: center;

  label {
    justify-content: center;
  }
`;

export const StudentLink = styled.button`
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
`;

export const SummaryCards = styled(StatsGrid)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

