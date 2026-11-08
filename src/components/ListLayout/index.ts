// Libs
import styled from 'styled-components';

export const PageFlexWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
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
