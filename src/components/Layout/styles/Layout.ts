// React
import { Link } from 'react-router-dom';
// Libs
import { fadeDown, fadeUp } from 'bp-kit';
import styled from 'styled-components';

export const SIDEMENU_WIDTH = 248;

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.canvas};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.base};

  @media (min-width: 745px) { display: none; }
`;

export const HeaderInner = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const SideMenu = styled.aside`
  display: none;

  @media (min-width: 745px) {
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

export const SideNav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SideNavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  height: 42px;
  padding: 0 ${({ theme }) => theme.spacing.md};
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

export const UserArea = styled.div`
  position: relative;
  flex-shrink: 0;
`;

export const UserBtn = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.canvas};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 500;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: ${({ theme }) => theme.shadows.md}; }
`;

export const Dropdown = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? 'block' : 'none')};
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: ${({ theme }) => theme.colors.canvas};
  border-radius: ${({ theme }) => theme.rounded.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
  overflow: hidden;
  z-index: 200;
  animation: ${fadeDown} 0.15s ease;
`;

export const DropdownHeader = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.base}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairlineSoft};
`;

export const DropdownName = styled.p`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  color: ${({ theme }) => theme.colors.ink};
`;

export const DropdownRole = styled.p`
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

export const DropdownDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.hairlineSoft};
`;

export const BottomBar = styled.nav`
  display: none;

  @media (max-width: 744px) {
    display: flex;
    justify-content: center;
    gap: 40px;
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
`;

export const Main = styled.main<{ $hasBottomBar: boolean }>`
  min-height: calc(100vh - 64px);
  background: ${({ theme }) => theme.colors.canvas};

  @media (max-width: 744px) {
    padding-bottom: ${({ $hasBottomBar }) => ($hasBottomBar ? 'calc(56px + env(safe-area-inset-bottom))' : '0')};
  }

  @media (min-width: 745px) {
    min-height: 100vh;
    margin-left: ${SIDEMENU_WIDTH}px;
  }
`;

export const MainInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl};
  animation: ${fadeUp} 0.25s ease;

  @media (max-width: 744px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.lg};
  }

  @media (min-width: 745px) {
    padding-top: ${({ theme }) => theme.spacing.xl};
  }
`;
