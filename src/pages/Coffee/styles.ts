// Libs
import styled from 'styled-components';

export const Section = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

export const Hint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: ${({ theme }) => `-${theme.spacing.sm}`};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;
