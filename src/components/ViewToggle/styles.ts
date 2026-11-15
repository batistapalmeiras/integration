// Libs
import styled from 'styled-components';

export const ToggleGroup = styled.div`
  flex-shrink: 0;
  display: inline-flex;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.sm};
  overflow: hidden;
`;

export const ToggleButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 34px;
  border: none;
  background: ${({ theme, $active }) => ($active ? theme.colors.primarySoft : theme.colors.canvas)};
  color: ${({ theme, $active }) => ($active ? theme.colors.luxe : theme.colors.muted)};
  cursor: pointer;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.colors.hairline};
  }
`;
