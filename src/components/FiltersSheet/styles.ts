// Libs
import styled from 'styled-components';

export const Sheet = styled.div<{ $scrolled: boolean }>`
  --sheet-x: 32px;
  --sheet-y: 32px;
  display: flex;
  flex-direction: column;
  min-height: 100%;

  @media (max-width: 744px) {
    --sheet-y: 28px;
  }

  @media (max-width: 480px) {
    --sheet-x: 20px;
    --sheet-y: 24px;
  }

  & > :first-child {
    position: sticky;
    top: calc(-1 * var(--sheet-y));
    z-index: 2;
    margin: calc(-1 * var(--sheet-y)) calc(-1 * var(--sheet-x)) ${({ theme }) => theme.spacing.lg};
    padding: var(--sheet-y) var(--sheet-x) ${({ theme }) => theme.spacing.base};
    border-bottom: 1px solid ${({ theme, $scrolled }) => ($scrolled ? theme.colors.hairline : 'transparent')};
    background: ${({ theme }) => theme.colors.canvas};
  }
`;

export const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};

  & + & {
    margin-top: calc(${({ theme }) => theme.spacing.xl} - ${({ theme }) => theme.spacing.md});
    padding-top: ${({ theme }) => theme.spacing.xl};
    border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  }

  &:last-child {
    padding-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

export const GroupTitle = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
  font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
  color: ${({ theme }) => theme.colors.ink};
`;

export const Footer = styled.div`
  position: sticky;
  bottom: calc(-1 * var(--sheet-y));
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin: auto calc(-1 * var(--sheet-x)) calc(-1 * var(--sheet-y));
  padding: ${({ theme }) => theme.spacing.md} var(--sheet-x)
    calc(${({ theme }) => theme.spacing.md} + env(safe-area-inset-bottom));
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  background: ${({ theme }) => theme.colors.canvas};

  & > button:first-child {
    width: auto;
    justify-content: flex-start;
  }
`;
