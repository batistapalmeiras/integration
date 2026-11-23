// Libs
import styled from 'styled-components';

export const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};

  & + & {
    margin-top: calc(${({ theme }) => theme.spacing.xl} - ${({ theme }) => theme.spacing.md});
    padding-top: ${({ theme }) => theme.spacing.xl};
    border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  }

  &:last-child {
    padding-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

export const GroupTitle = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
  font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
  color: ${({ theme }) => theme.colors.ink};
`;

export const FooterContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  & > button:first-child {
    width: auto;
    justify-content: flex-start;
  }
`;
