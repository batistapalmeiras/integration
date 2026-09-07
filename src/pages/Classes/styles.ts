// Libs
import styled from 'styled-components';

export { Form } from 'bp-kit';

export const PaginationWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export const SearchRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
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
