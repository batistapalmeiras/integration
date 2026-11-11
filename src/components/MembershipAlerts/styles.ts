// Libs
import styled, { css } from 'styled-components';

export const AlertItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

export const AlertSection = styled.section<{ $boxed: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};

  ${({ $boxed, theme }) =>
    $boxed &&
    `
    padding: 18px ${theme.spacing.base};
    border: 1px solid ${theme.colors.hairline};
    border-radius: 14px;
  `}

  ${({ $boxed, theme }) =>
    $boxed &&
    css`
      ${AlertItem} + ${AlertItem} {
        padding-top: ${theme.spacing.md};
        border-top: 1px solid ${theme.colors.hairline};
      }
    `}
`;

export const AlertSectionTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.danger};
`;

export const AlertTitle = styled.span`
  font-weight: 600;
`;

export const AlertAnswer = styled.span`
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const AlertNote = styled.span`
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;
