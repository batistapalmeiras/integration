// Libs
import styled from 'styled-components';

export const PageFlexWrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px - 56px - env(safe-area-inset-bottom) - ${({ theme }) => theme.spacing.sm} - ${({ theme }) => theme.spacing.lg});

  @media (min-width: 745px) {
    min-height: calc(100vh - ${({ theme }) => theme.spacing.xl} - ${({ theme }) => theme.spacing.xl});
  }
`;

export const PageFlexBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const SearchFiltersRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  > *:first-child {
    flex: 1;
  }
`;

export const PaginationWrap = styled.div`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.lg};
`;
