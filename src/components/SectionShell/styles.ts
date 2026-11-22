// React
import { Link } from 'react-router-dom';
// Libs
import styled from 'styled-components';
// Local
import { SideMenu, SIDEMENU_MEDIA, SIDEMENU_OFFSET } from '../Layout/styles';

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.canvas};
`;

const HEADER_HEIGHT = 64;

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  box-sizing: border-box;
  height: calc(${HEADER_HEIGHT}px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) ${({ theme }) => theme.spacing.base} 0;
  background: ${({ theme }) => theme.colors.canvas};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};

  @media ${SIDEMENU_MEDIA} {
    padding-left: ${({ theme }) => theme.spacing.xl};
    padding-right: ${({ theme }) => theme.spacing.xl};
  }
`;

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.sm};
  border: 0;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }
`;

export const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

export const BrandLogo = styled.img`
  height: 36px;
  width: auto;
  object-fit: contain;
`;

export const SectionSwitcher = styled.nav`
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  overflow-x: auto;
  scrollbar-width: none;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.surfaceSoft};

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const SwitcherLink = styled(Link)<{ $active: boolean }>`
  flex: 1 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.rounded.full};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ theme, $active }) => ($active ? theme.colors.ink : theme.colors.muted)};
  background: ${({ theme, $active }) => ($active ? theme.colors.canvas : 'transparent')};
  box-shadow: ${({ theme, $active }) => ($active ? theme.shadows.sm : 'none')};
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.15s,
    color 0.15s;
`;

export const Content = styled.div`
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.base};

  @media ${SIDEMENU_MEDIA} {
    margin-left: ${SIDEMENU_OFFSET};
    padding: ${({ theme }) => theme.spacing.xl} 48px;
  }
`;

export const SectionMenu = styled(SideMenu)`
  @media ${SIDEMENU_MEDIA} {
    top: calc(${HEADER_HEIGHT}px + env(safe-area-inset-top));
    z-index: 20;
  }
`;
