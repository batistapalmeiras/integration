// Libs
import styled from 'styled-components';

export const SearchRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const SortRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  & > :first-child {
    flex: 1;
    min-width: 0;
  }
`;

