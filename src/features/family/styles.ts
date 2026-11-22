// Libs
import styled from 'styled-components';

export const AddLink = styled.div`
  display: flex;
  justify-content: flex-start;

  & > button {
    width: auto;
    padding: 0;
  }
`;

export const RowPerson = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

export const SuggestingHint = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;
