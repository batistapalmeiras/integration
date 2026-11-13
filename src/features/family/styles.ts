// Libs
import styled from 'styled-components';

export const FamilyRows = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const FamilyRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 52px;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  color: ${({ theme }) => theme.colors.ink};

  & > :first-child {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  & > button {
    width: auto;
    flex-shrink: 0;
  }
`;

export const AddLink = styled.div`
  display: flex;
  justify-content: flex-start;

  & > button {
    width: auto;
    padding: 0;
  }
`;
