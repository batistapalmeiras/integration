// Libs
import styled from 'styled-components';
import { Form as BaseForm } from 'bp-kit';

export const Form = styled(BaseForm)`
  max-width: 420px;
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};

  & > button {
    width: 100%;
  }
`;
