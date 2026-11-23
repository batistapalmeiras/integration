// Libs
import styled from 'styled-components';

export const IconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: ${({ theme }) => `${theme.colors.primary}1f`};
  color: ${({ theme }) => theme.colors.primaryActive};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 48px;
    height: 48px;
    border-radius: ${({ theme }) => theme.rounded.md};
  }
`;

