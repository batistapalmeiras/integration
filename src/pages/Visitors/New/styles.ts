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

export const InlineFields = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Intro = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.body};
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
  font-family: ${({ theme }) => theme.typography.fontFamily};

  strong {
    font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
    color: ${({ theme }) => theme.colors.ink};
  }

  span {
    font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
    color: ${({ theme }) => theme.colors.muted};
  }
`;

export const ExistingRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.base};
  border-top: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};

  span:first-child {
    color: ${({ theme }) => theme.colors.muted};
  }

  span:last-child {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.ink};
  }
`;
