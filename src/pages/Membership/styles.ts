// Libs
import styled from 'styled-components';
// Components
import { Callout } from '../../components/Callout';

export const CouncilBar = styled(Callout)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  & > button {
    width: auto;
    padding: 0;
  }
`;

export const CouncilLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const WideOnly = styled.span`
  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    display: none;
  }
`;
