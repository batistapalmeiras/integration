// Libs
import styled from 'styled-components';

export const PersonLink = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
`;

export const RowActions = styled.span`
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: -4px 0 -4px auto;
`;

export const IconAction = styled.button<{ $tone?: 'positive' | 'negative' }>`
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: ${({ theme }) => theme.colors.canvas};
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &[aria-pressed='true'] {
    border-color: ${({ theme, $tone }) => ($tone === 'positive' ? theme.colors.success : theme.colors.primaryErrorText)};
    background: ${({ theme, $tone }) => ($tone === 'positive' ? theme.colors.successSurface : theme.colors.canvas)};
    color: ${({ theme, $tone }) => ($tone === 'positive' ? theme.colors.success : theme.colors.primaryErrorText)};
  }
`;

export const PaginationWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export const Hint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;
