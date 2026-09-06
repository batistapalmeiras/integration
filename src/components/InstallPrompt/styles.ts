// Libs
import { Button } from 'bp-kit';
import styled from 'styled-components';

export const Banner = styled.div`
  position: fixed;
  left: ${({ theme }) => theme.spacing.base};
  right: ${({ theme }) => theme.spacing.base};
  bottom: calc(${({ theme }) => theme.spacing.base} + env(safe-area-inset-bottom));
  z-index: 100;

  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.base};
  background: ${({ theme }) => theme.colors.surfaceCard};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  box-shadow: ${({ theme }) => theme.shadows.md};

  max-width: 420px;
  margin: 0 auto;
`;

export const Icon = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
`;

export const Text = styled.p`
  flex: 1;
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.body};
`;

export const InstallButton = styled(Button)`
  && {
    height: 36px;
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
  flex-shrink: 0;
  white-space: nowrap;
`;

export const DismissButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
`;
