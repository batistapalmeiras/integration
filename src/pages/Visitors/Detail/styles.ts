// Libs
import styled from 'styled-components';

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Content = styled.div`
  max-width: 480px;
`;

export const StatusRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.base};
`;
