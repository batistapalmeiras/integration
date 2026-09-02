// Libs
import styled from 'styled-components';

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

// The shared RowActions wraps (flex-wrap: wrap), which stacks icons
// vertically once the $shrink column shrinks the cell to content width —
// same issue fixed for Café's AttendanceRow. These rows never need to wrap.
export const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StatusPill = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  padding: 2px ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.rounded.full};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: 600;
  background: ${({ theme, $active }) => ($active ? theme.colors.successSurface : theme.colors.surfaceStrong)};
  color: ${({ theme, $active }) => ($active ? theme.colors.success : theme.colors.muted)};
`;
