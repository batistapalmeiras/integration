// Libs
import { Form as BaseForm } from 'bp-kit';
import styled from 'styled-components';

export const Form = styled(BaseForm)`
  max-width: 420px;
`;

export const InlineFields = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

export const VisitorFormActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};

  & > button {
    width: 100%;
  }
`;
