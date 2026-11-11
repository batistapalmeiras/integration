// Libs
import styled from 'styled-components';

export const Callout = styled.div`
  container-type: inline-size;
  padding: ${({ theme }) => theme.spacing.base};
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.ink};
`;

export const CalloutContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  & > button {
    width: 100%;
  }

  @container (min-width: 540px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    & > button {
      width: auto;
      flex-shrink: 0;
    }
  }
`;
