// Libs
import styled from 'styled-components';

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.base};
`;

export const Card = styled.div`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.canvas};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.colors.primaryErrorText};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
`;

export const ConfirmationList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: ${({ theme }) => theme.spacing.md} 0;
  padding: ${({ theme }) => theme.spacing.base};
  background: ${({ theme }) => theme.colors.hairlineSoft};
  border-radius: ${({ theme }) => theme.rounded.md};
`;
