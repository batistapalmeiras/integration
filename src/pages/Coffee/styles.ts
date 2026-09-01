// Libs
import styled from 'styled-components';

// Never wraps — unlike the shared RowActions, this always needs to sit
// side by side in a $shrink table column, not stack when the column is tight.
export const AttendanceRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const Hint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;
