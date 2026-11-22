// Libs
import styled, { css, keyframes } from 'styled-components';

export const Wrap = styled.div`
  position: relative;
`;

export const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: 0;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: transparent;
  cursor: pointer;
  transition: box-shadow 0.15s;

  &:hover,
  &[aria-expanded='true'] {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.surfaceSoft};
  }
`;

export const ModalBody = styled.div`
  --menu-inset: 0px;
  --menu-identity-top: 0px;
`;

export const POPOVER_EXIT_MS = 120;

const popIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const popOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-6px) scale(0.96);
  }
`;

export const Popover = styled.div<{ $closing: boolean }>`
  --menu-inset: ${({ theme }) => theme.spacing.base};
  --menu-identity-top: ${({ theme }) => theme.spacing.base};
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  width: 280px;
  background: ${({ theme }) => theme.colors.canvas};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: 14px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  transform-origin: top right;
  animation: ${({ $closing }) =>
    $closing
      ? css`
          ${popOut} ${POPOVER_EXIT_MS}ms ease-in forwards
        `
      : css`
          ${popIn} 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)
        `};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: var(--menu-identity-top, 0px) var(--menu-inset, 0px) ${({ theme }) => theme.spacing.base};
`;

export const IdentityText = styled.div`
  min-width: 0;
`;

export const Name = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
  overflow-wrap: anywhere;
`;

export const Role = styled.p`
  margin: 2px 0 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const Divider = styled.hr`
  margin: 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
`;

export const Item = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} var(--menu-inset, 0px);
  border: 0;
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  color: ${({ theme }) => theme.colors.ink};
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }

  &.danger {
    color: ${({ theme }) => theme.colors.primaryErrorText};
  }
`;
