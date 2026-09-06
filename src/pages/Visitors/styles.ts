// Libs
import { Button } from 'bp-kit';
import styled from 'styled-components';

export const PaginationWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

// Search input and Filtros button share one row — the button is capped to
// the search field's own height/radius (40px, rounded.md) instead of the
// taller default Button size, so they read as one compact control cluster.
export const SearchFiltersRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  > *:first-child {
    flex: 1;
  }
`;

export const CompactFilterButton = styled(Button)`
  && {
    height: 40px;
    padding: 0 ${({ theme }) => theme.spacing.base};
    border-radius: ${({ theme }) => theme.rounded.md};
  }
  flex-shrink: 0;
  white-space: nowrap;
`;
