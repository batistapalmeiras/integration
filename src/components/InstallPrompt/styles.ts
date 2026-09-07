// Libs
import styled from 'styled-components';

// Sits under the login form as plain text (not a floating card), but with
// enough visual weight — soft tint background, bolder text — that it reads
// as a real hint rather than fine print. Mobile/tablet only, desktop users
// aren't installing a home-screen app.
export const Prompt = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary}14;
  border-radius: ${({ theme }) => theme.rounded.md};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
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
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
  cursor: pointer;
`;
