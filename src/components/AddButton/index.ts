// Libs
import styled from 'styled-components';

export const AddButton = styled.button`
  width: 100%;
  min-height: 48px;
  margin-top: ${({ theme }) => theme.spacing.base};
  border: 1px dashed ${({ theme }) => theme.colors.mutedSoft};
  border-radius: ${({ theme }) => theme.rounded.md};
  background: ${({ theme }) => theme.colors.canvas};
  color: ${({ theme }) => theme.colors.ink};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
`;
