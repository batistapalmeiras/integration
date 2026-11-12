// Libs
import styled from 'styled-components';
// Components
import { EndActions } from '../../components/FormLayout';
import { SideColumn } from '../../components/PageColumns';

export const Actions = styled(EndActions)`
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};

  & > button {
    width: 100%;
  }
`;

export const Answers = styled(SideColumn)`
  @media (max-width: calc(${({ theme }) => theme.breakpoints.tablet} - 1px)) {
    padding-bottom: ${({ theme }) => theme.spacing.xl};
    border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
  }
`;

export const CommunityGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.lg};
  align-items: start;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
