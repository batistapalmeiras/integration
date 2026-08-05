// Libs
import styled from 'styled-components';

export const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

export const Hint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;
