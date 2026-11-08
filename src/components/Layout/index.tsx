// React
import React, { Fragment, useState } from 'react';
// Libs
import { useMediaQuery } from 'bp-kit';
import { ChevronDown, ChevronLeft, LogOut, User } from 'lucide-react';
// Components
import icon from '../../assets/icon.png';
import {
  activeNavPath,
  areaItems,
  findNavArea,
  isNavGroup,
  MORE_TAB_ICON,
  MORE_TAB_LABEL,
  NAV_ITEMS,
  NavItem,
  navAreasFor,
} from '../../routes/navigation';
import { homeRouteFor } from '../../routes/HomeRedirect';
import { AppRoute } from '../../routes/paths';
import { ROLE_LABELS } from '../../types/enums';
// Local
import { useLayout } from './hooks';
import { NavDestinationContext } from './navDestination';
import {
  BottomBar,
  BottomTab,
  BottomTabLabel,
  DropdownItem,
  Main,
  MainInner,
  ModuleBar,
  SIDEMENU_MEDIA,
  SideBrand,
  SideBrandLink,
  SideBrandLogo,
  SideBrandName,
  SideFooter,
  SideMenu,
  SideNav,
  SideNavArea,
  SideNavAreaToggle,
  SideNavCount,
  SideNavGroupToggle,
  SideNavLink,
  SideUserInfo,
  SideUserName,
  SideUserRole,
  TabCount,
  TabIcon,
} from './styles';

interface ILayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: ILayoutProps) {
  const { user, navigate, handleLogout, isExactTab, pathname, membershipCount } = useLayout();
  const navAreas = navAreasFor(user?.role);
  const navPaths = [NAV_ITEMS.dashboard.path, ...navAreas.flatMap((area) => areaItems(area).map((item) => item.path))];
  const activePath = activeNavPath(pathname, navPaths);
  const activeArea =
    navAreas.find((area) => areaItems(area).some((item) => item.path === activePath)) ??
    findNavArea(navAreas, pathname);
  const activeGroup = activeArea?.more
    .filter(isNavGroup)
    .find((group) => group.items.some((item) => item.path === activePath));
  const activeKeys = [activeArea?.id, activeGroup && `${activeArea?.id}/${activeGroup.id}`].filter(
    (key): key is string => !!key,
  );
  const activeKeysSignature = activeKeys.join('|');

  const [openKeys, setOpenKeys] = useState<string[]>(activeKeys);
  const [lastActiveKeys, setLastActiveKeys] = useState(activeKeysSignature);
  if (activeKeysSignature !== lastActiveKeys) {
    setLastActiveKeys(activeKeysSignature);
    setOpenKeys(activeKeys);
  }

  const toggleKey = (key: string) =>
    setOpenKeys((open) => (open.includes(key) ? open.filter((openKey) => openKey !== key) : [...open, key]));

  const renderNavLink = (item: NavItem, nested = false) => (
    <SideNavLink key={item.path} to={item.path} $active={activePath === item.path} $nested={nested}>
      <item.icon size={18} />
      {item.label}
      {item.path === AppRoute.Membership && membershipCount > 0 && <SideNavCount>{membershipCount}</SideNavCount>}
    </SideNavLink>
  );
  const hasSidebar = useMediaQuery(SIDEMENU_MEDIA);
  const isSidebarDestination = navPaths.includes(pathname);

  const homeRoute = homeRouteFor();

  const currentArea = findNavArea(navAreas, pathname);
  const bottomTabs: NavItem[] = currentArea
    ? [
        ...currentArea.tabs,
        ...(currentArea.morePath ? [{ label: MORE_TAB_LABEL, path: currentArea.morePath, icon: MORE_TAB_ICON }] : []),
      ]
    : [
        NAV_ITEMS.dashboard,
        ...navAreas.map((area) => ({ label: area.title, path: area.tabs[0].path, icon: area.icon })),
        NAV_ITEMS.profile,
      ];
  const hasOuterTabs = navAreas.length > 1;
  const isOnTab = !!currentArea || (hasOuterTabs && (isExactTab(AppRoute.Dashboard) || isExactTab(AppRoute.Profile)));

  const shouldShowBottomBar = isOnTab;
  const isNavDestination = hasSidebar ? isSidebarDestination : shouldShowBottomBar;

  return (
    <>
      <SideMenu>
        <SideBrand>
          <SideBrandLink to={homeRoute}>
            <SideBrandLogo src={icon} alt="" />
            <SideBrandName>Batista Palmeiras</SideBrandName>
          </SideBrandLink>
        </SideBrand>

        <SideNav>
          <SideNavLink to={NAV_ITEMS.dashboard.path} $active={activePath === NAV_ITEMS.dashboard.path}>
            <NAV_ITEMS.dashboard.icon size={18} />
            {NAV_ITEMS.dashboard.label}
          </SideNavLink>
          {navAreas.map((area) => {
            const open = openKeys.includes(area.id);
            return (
              <SideNavArea key={area.title}>
                <SideNavAreaToggle
                  type="button"
                  $open={open}
                  aria-expanded={open}
                  onClick={() => toggleKey(area.id)}
                >
                  {area.title}
                  <ChevronDown size={14} />
                </SideNavAreaToggle>
                {open && area.tabs.map((item) => renderNavLink(item))}
                {open &&
                  area.more.map((entry) => {
                    if (!isNavGroup(entry)) return renderNavLink(entry);
                    const key = `${area.id}/${entry.id}`;
                    const groupOpen = openKeys.includes(key);
                    return (
                      <Fragment key={key}>
                        <SideNavGroupToggle
                          type="button"
                          $open={groupOpen}
                          aria-expanded={groupOpen}
                          onClick={() => toggleKey(key)}
                        >
                          <entry.icon size={18} />
                          {entry.label}
                          <ChevronDown size={14} />
                        </SideNavGroupToggle>
                        {groupOpen && entry.items.map((item) => renderNavLink(item, true))}
                      </Fragment>
                    );
                  })}
              </SideNavArea>
            );
          })}
        </SideNav>

        <SideFooter>
          <SideUserInfo>
            <SideUserName>{user?.name}</SideUserName>
            <SideUserRole>{user ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : ''}</SideUserRole>
          </SideUserInfo>
          <DropdownItem onClick={() => navigate(AppRoute.Profile)}>
            <User size={16} />
            Meu perfil
          </DropdownItem>
          <DropdownItem className="danger" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </DropdownItem>
        </SideFooter>
      </SideMenu>

      <Main $hasBottomBar={shouldShowBottomBar}>
        {currentArea && (
          <ModuleBar to={AppRoute.Dashboard}>
            <ChevronLeft size={20} />
            {currentArea.title}
          </ModuleBar>
        )}
        <MainInner>
          <NavDestinationContext.Provider value={isNavDestination}>{children}</NavDestinationContext.Provider>
        </MainInner>
      </Main>

      {shouldShowBottomBar && (
        <BottomBar>
          {bottomTabs.map((item) => {
            const active = pathname === item.path;
            return (
              <BottomTab key={item.path} to={item.path} $active={active}>
                <TabIcon>
                  <item.icon size={22} />
                  {item.path === AppRoute.Membership && membershipCount > 0 && <TabCount>{membershipCount}</TabCount>}
                </TabIcon>
                <BottomTabLabel $active={active}>{item.tabLabel ?? item.label}</BottomTabLabel>
              </BottomTab>
            );
          })}
        </BottomBar>
      )}
    </>
  );
}
