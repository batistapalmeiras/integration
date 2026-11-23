// Libs
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 6px;
  border-radius: ${({ theme }) => theme.rounded.md};
  background: ${({ theme }) => theme.colors.surfaceStrong};
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.base};

  & > :first-child {
    flex: 1;
    min-width: 0;
  }

  & > button {
    width: 56px;
    height: 56px;
  }
`;

export const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing.base};
`;

export const Arrow = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    color: ${({ theme }) => theme.colors.borderStrong};
    cursor: default;
  }
`;

export const Label = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;
