// Libs
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.base};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
`;

export const Bars = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const Bar = styled.span<{ $filled: boolean }>`
  height: 6px;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme, $filled }) => ($filled ? theme.colors.primary : theme.colors.hairline)};
`;

export const Labels = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const Label = styled.span<{ $current: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.badge.fontSize};
  text-align: center;
  font-weight: ${({ theme, $current }) =>
    $current ? theme.typography.titleMd.fontWeight : theme.typography.bodyMd.fontWeight};
  color: ${({ theme, $current }) => ($current ? theme.colors.ink : theme.colors.muted)};
`;
