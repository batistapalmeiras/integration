// React
import { Link } from 'react-router-dom';
// Libs
import { fadeUp } from 'bp-kit';
import styled from 'styled-components';

const SIDEMENU_WIDTH = 248;
export const SIDEMENU_MEDIA = '(min-width: 745px)';

export const SideMenu = styled.aside`
  display: none;

  @media ${SIDEMENU_MEDIA} {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: ${SIDEMENU_WIDTH}px;
    background: ${({ theme }) => theme.colors.canvas};
    border-right: 1px solid ${({ theme }) => theme.colors.hairline};
    z-index: 100;
  }
`;

export const SideBrand = styled.div`
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
`;

export const SideBrandLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  text-decoration: none;
`;

export const SideBrandLogo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

export const SideBrandName = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.ink};
`;

export const SideNav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SideNavArea = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const SideNavAreaToggle = styled.button<{ $open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border: 0;
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.microLabel.fontSize};
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;

  svg {
    transition: transform 0.15s;
    transform: rotate(${({ $open }) => ($open ? '0deg' : '-90deg')});
  }

  &:hover { color: ${({ theme }) => theme.colors.ink}; }
`;

export const SideNavLink = styled(Link)<{ $active: boolean; $nested?: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  height: 42px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  padding-left: ${({ theme, $nested }) => ($nested ? `calc(${theme.spacing.md} + 26px)` : theme.spacing.md)};
  border-radius: ${({ theme }) => theme.rounded.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.navLink.fontSize};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ theme, $active }) => ($active ? theme.colors.ink : theme.colors.muted)};
  background: ${({ theme, $active }) => ($active ? theme.colors.surfaceSoft : 'transparent')};
  border-left: 2px solid ${({ theme, $active }) => ($active ? theme.colors.primary : 'transparent')};
  text-decoration: none;
  transition: background 0.15s, color 0.15s;

  svg {
    flex-shrink: 0;
    stroke-width: ${({ $active }) => ($active ? 2 : 1.5)};
  }

  &:hover { background: ${({ theme }) => theme.colors.surfaceSoft}; color: ${({ theme }) => theme.colors.ink}; }
`;

export const SideNavGroupToggle = styled.button<{ $open: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  height: 42px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border: 0;
  border-left: 2px solid transparent;
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.navLink.fontSize};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.muted};
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  svg {
    flex-shrink: 0;
    stroke-width: 1.5;
  }

  svg:last-child {
    margin-left: auto;
    transition: transform 0.15s;
    transform: rotate(${({ $open }) => ($open ? '0deg' : '-90deg')});
  }

  &:hover { background: ${({ theme }) => theme.colors.surfaceSoft}; color: ${({ theme }) => theme.colors.ink}; }
`;

export const SideFooter = styled.div`
  flex-shrink: 0;
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
`;

export const SideUserInfo = styled.div`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
`;

export const SideUserName = styled.p`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  color: ${({ theme }) => theme.colors.ink};
`;

export const SideUserRole = styled.p`
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 2px;
`;

export const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.base}`};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.ink};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  &:hover { background: ${({ theme }) => theme.colors.surfaceSoft}; }
  &.danger { color: ${({ theme }) => theme.colors.primaryErrorText}; }
`;

export const BottomBar = styled.nav`
  display: none;

  @media (max-width: 744px) {
    display: flex;
    justify-content: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    padding-bottom: env(safe-area-inset-bottom);
  }
`;

export const BottomTab = styled(Link)<{ $active: boolean }>`
  flex: 1;
  max-width: 96px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 12px 0 10px;
  text-decoration: none;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : '#b0b0b0')};
  transition: color 0.2s;

  svg {
    stroke-width: ${({ $active }) => ($active ? 2 : 1.5)};
    fill: ${({ theme, $active }) => ($active ? theme.colors.primary : 'none')};
    fill-opacity: ${({ $active }) => ($active ? 0.12 : 0)};
  }
`;

export const BottomTabLabel = styled.span<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  line-height: 1;
  letter-spacing: 0.2px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TabIcon = styled.span`
  position: relative;
  display: inline-flex;
`;

export const TabCount = styled.span`
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.onDark};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
`;

export const SideNavCount = styled.span`
  margin-left: auto;
  min-width: 20px;
  padding: 0 6px;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.onDark};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: 700;
  line-height: 20px;
  text-align: center;
`;

export const Main = styled.main<{ $hasBottomBar: boolean }>`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.canvas};

  @media (max-width: 744px) {
    padding-bottom: ${({ $hasBottomBar }) => ($hasBottomBar ? 'calc(56px + env(safe-area-inset-bottom))' : '0')};
  }

  @media ${SIDEMENU_MEDIA} {
    margin-left: ${SIDEMENU_WIDTH}px;
  }
`;

export const ModuleBar = styled(Link)`
  display: none;

  @media (max-width: 744px) {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: calc(${({ theme }) => theme.spacing.md} + env(safe-area-inset-top)) ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.md};
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
    font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
    color: ${({ theme }) => theme.colors.ink};
    text-decoration: none;
  }
`;

export const MainInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl};
  animation: ${fadeUp} 0.25s ease;

  @media (max-width: 744px) {
    padding: calc(${({ theme }) => theme.spacing.lg} + env(safe-area-inset-top)) ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.lg};
  }

  @media ${SIDEMENU_MEDIA} {
    padding-top: ${({ theme }) => theme.spacing.xl};
  }
`;
