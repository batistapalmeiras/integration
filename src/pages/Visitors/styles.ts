// Libs
import styled from 'styled-components';

export const PaginationWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

// Search input and Filtros button share one row — both pass size="sm" so
// they line up at the same 36px height.
export const SearchFiltersRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  > *:first-child {
    flex: 1;
  }
`;
