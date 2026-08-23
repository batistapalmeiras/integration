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

export const Content = styled.div`
  width: 100%;
  max-width: 480px;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export { Form } from 'bp-kit';

export const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.colors.primaryErrorText};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
`;
