// Libs
import styled from 'styled-components';

export const RowButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
`;

export const Name = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

export const Detail = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const BirthdayGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const BirthdayCard = styled.li<{ $today: boolean }>`
  display: flex;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  background: ${({ theme, $today }) => ($today ? theme.colors.primarySoft : theme.colors.canvas)};
`;

export const MonthTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.xxs};
  padding: 6px;
  margin-bottom: ${({ theme }) => theme.spacing.base};
  border-radius: ${({ theme }) => theme.rounded.md};
  background: ${({ theme }) => theme.colors.surfaceStrong};
`;

export const MonthButton = styled.button<{ $selected: boolean }>`
  height: 40px;
  border: none;
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.canvas : 'transparent')};
  box-shadow: ${({ theme, $selected }) => ($selected ? theme.shadows.sm : 'none')};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: ${({ $selected }) => ($selected ? 600 : 500)};
  color: ${({ theme, $selected }) => ($selected ? theme.colors.ink : theme.colors.muted)};
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

export const CountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;
