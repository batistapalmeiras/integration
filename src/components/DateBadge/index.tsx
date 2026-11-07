// Libs
import styled from 'styled-components';
// Local
import { shortMonthName } from '../../domain/dates';

const Badge = styled.span<{ $strong?: boolean }>`
  flex: none;
  width: 48px;
  height: 52px;
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: ${({ theme, $strong }) => ($strong ? theme.colors.primary : theme.colors.primarySoft)};
  color: ${({ theme, $strong }) => ($strong ? theme.colors.onPrimary : theme.colors.luxe)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.1;
  font-size: 18px;
  font-weight: 700;

  small {
    font-size: ${({ theme }) => theme.typography.badge.fontSize};
    font-weight: 600;
    text-transform: uppercase;
  }
`;

interface Props {
  date: string;
  strong?: boolean;
}

export function DateBadge({ date, strong }: Props) {
  return (
    <Badge $strong={strong}>
      {date.slice(8, 10)}
      <small>{shortMonthName(Number(date.slice(5, 7)))}</small>
    </Badge>
  );
}
