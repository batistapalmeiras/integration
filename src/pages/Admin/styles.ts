// Libs
import styled from 'styled-components';

export const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

export const Hint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const OptionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const OptionLabel = styled.div`
  flex: 1;
`;
