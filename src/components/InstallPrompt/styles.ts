// Libs
import styled from 'styled-components';

// Plain text under the login form — mobile/tablet only, desktop users
// aren't installing a home-screen app.
export const Prompt = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0 0;
  text-align: center;
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.5;

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`;

export const InstallAction = styled.button`
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
  cursor: pointer;
`;
