// Libs
import styled from 'styled-components';

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 140px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.ink};
  background: ${({ theme }) => theme.colors.canvas};
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.ink};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.hairlineSoft};
  }
`;
