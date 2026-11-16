// Libs
import styled from 'styled-components';

export const Row = styled.div`
  & > label {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.md};
  }

  & > label > input {
    right: 0;
  }
`;

export const Text = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Title = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

export const Hint = styled.span`
  color: ${({ theme }) => theme.colors.muted};
`;
