// Libs
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  overflow-x: auto;
`;

export const Step = styled.div<{ $state: 'done' | 'current' | 'future' }>`
  flex: 1;
  min-width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;

  &:not(:first-child)::before {
    content: '';
    position: absolute;
    top: 15px;
    right: 50%;
    width: 100%;
    height: 2px;
    background: ${({ theme, $state }) => ($state === 'future' ? theme.colors.hairline : theme.colors.primary)};
    z-index: 0;
  }
`;

export const Circle = styled.div<{ $state: 'done' | 'current' | 'future' }>`
  position: relative;
  z-index: 1;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.rounded.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: 700;
  border: 2px solid
    ${({ theme, $state }) => ($state === 'future' ? theme.colors.hairline : theme.colors.primary)};
  background: ${({ theme, $state }) => ($state === 'done' || $state === 'current' ? theme.colors.primary : theme.colors.canvas)};
  color: ${({ theme, $state }) =>
    $state === 'done' || $state === 'current' ? theme.colors.onPrimary : theme.colors.mutedSoft};

  svg {
    width: 15px;
    height: 15px;
  }
`;

export const Label = styled.span<{ $state: 'done' | 'current' | 'future' }>`
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: ${({ $state }) => ($state === 'current' ? 700 : 500)};
  color: ${({ theme, $state }) => ($state === 'future' ? theme.colors.mutedSoft : theme.colors.ink)};
`;
