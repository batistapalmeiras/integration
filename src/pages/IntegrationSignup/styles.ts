// Libs
import styled from 'styled-components';

export const StepStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ConfirmationList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: 0;
  padding: ${({ theme }) => theme.spacing.base};
  background: ${({ theme }) => theme.colors.hairlineSoft};
  border-radius: ${({ theme }) => theme.rounded.md};
`;
