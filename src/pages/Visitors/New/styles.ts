// Libs
import { Form as BaseForm, Typography } from 'bp-kit';
import styled from 'styled-components';

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

export const InlineFields = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Intro = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const ExistingCard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  overflow: hidden;
  margin: ${({ theme }) => theme.spacing.base} 0;
`;

export const ExistingHead = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.base};
`;

export const ExistingName = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const ExistingRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.base};
  border-top: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
`;
