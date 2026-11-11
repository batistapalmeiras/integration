// Libs
import styled from 'styled-components';

export const WideContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 1040px;
`;

export const Columns = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};

  & > div {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.base};
    min-width: 0;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    align-items: start;
  }
`;

export const SideColumn = styled.div`
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    position: sticky;
    top: ${({ theme }) => theme.spacing.base};
  }
`;
