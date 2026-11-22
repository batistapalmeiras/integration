// React
import React, { Fragment, useEffect, useRef, useState } from 'react';
// Libs
import { useMediaQuery } from 'bp-kit';
import { ChevronDown, ChevronLeft } from 'lucide-react';
// Components
import logo from '../../assets/palmeiras-horizontal-verde.png';
import { ProfileMenu } from '../ProfileMenu';
import {
  activeNavPath,
  areaItems,
  findNavArea,
  isTabPath,
  isNavGroup,
  MORE_TAB_ICON,
  MORE_TAB_LABEL,
  NAV_ITEMS,
  NavItem,
} from '../../routes/navigation';
import { useNavAreas } from '../../features/access/useRole';
import { isStandalone } from '../../routes/table';
import { homeRouteFor } from '../../routes/HomeRedirect';
import { AppRoute } from '../../routes/paths';
import { useHideOnScroll } from '../../lib/useHideOnScroll';
import { useWindowScrolled } from '../../lib/useScrolled';
// Local
import { FlowContext } from './flow';
import { useLayout } from './hooks';
import { ModuleBarContext } from './moduleBar';
import { NavDestinationContext } from './navDestination';
import { ModuleBarTitleContext } from './moduleBarTitle';
import { ProfileSlotContext } from './profileSlot';
import { closedSideNavKeys } from './persistence';
import {
  BottomBar,
  BottomTab,
  BottomTabLabel,
  Main,
  MainInner,
  ModuleBar,
  ModuleBarLink,
  SideBrand,
  SideBrandLink,
  SideBrandLogo,
  SideMenu,
  SIDEMENU_MEDIA,
  SideNav,
  SideNavArea,
  SideNavAreaToggle,
  SideNavCount,
  SideNavGroupToggle,
  SideNavLink,
  TabCount,
  ProfileAnchor,
  ProfileSlot,
  TabIcon,
} from './styles';

const DashboardIcon = NAV_ITEMS.dashboard.icon;

interface ILayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: ILayoutProps) {
  const { isExactTab, pathname, search, membershipCount } = useLayout();
  const standalone = isStandalone(pathname);
  const flowPath = useRef<string>(AppRoute.Dashboard);

  useEffect(() => {
    if (!standalone) flowPath.current = `${pathname}${search}`;
  }, [standalone, pathname, search]);
  const navAreas = useNavAreas();
  const navPaths = [NAV_ITEMS.dashboard.path, ...navAreas.flatMap((area) => areaItems(area).map((item) => item.path))];
  const activePath = activeNavPath(pathname, navPaths);
  const [moduleBarHidden, setModuleBarHidden] = useState(false);
  const [closedKeys, setClosedKeys] = useState<string[]>(() => closedSideNavKeys.load() ?? []);
  const isOpen = (key: string) => !closedKeys.includes(key);

  const toggleKey = (key: string) => {
    const next = isOpen(key) ? [...closedKeys, key] : closedKeys.filter((closedKey) => closedKey !== key);
    setClosedKeys(next);
    closedSideNavKeys.save(next);
  };

  const toggleArea = (areaId: string) => {
    const isLastOpenArea = isOpen(areaId) && !navAreas.some((area) => area.id !== areaId && isOpen(area.id));
    if (!isLastOpenArea) toggleKey(areaId);
  };

  const renderNavLink = (item: NavItem, nested = false) => (
    <SideNavLink key={item.path} to={item.path} $active={activePath === item.path} $nested={nested}>
      <item.icon size={18} />
      {item.label}
      {item.path === AppRoute.Membership && membershipCount > 0 && <SideNavCount>{membershipCount}</SideNavCount>}
    </SideNavLink>
  );
  const hasSidebar = useMediaQuery(SIDEMENU_MEDIA);
  const isSidebarDestination = navPaths.some((navPath) => isTabPath(pathname, navPath));

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
      ];
  const hasOuterTabs = navAreas.length > 1;
  const isOnTab = !!currentArea || (hasOuterTabs && isExactTab(AppRoute.Dashboard));

  const shouldShowBottomBar = isOnTab && bottomTabs.length > 1;
  const bottomBarHidden = useHideOnScroll(shouldShowBottomBar, pathname);
  const scrolled = useWindowScrolled();
  const isNavDestination = hasSidebar ? isSidebarDestination : isOnTab;
  const showModuleBar = !!currentArea && !moduleBarHidden && !hasSidebar;
  const showProfileSlot = !showModuleBar;
  const activeTab = bottomTabs.find((item) => isTabPath(pathname, item.path));
  const moduleBarTitle = showModuleBar && activeTab ? activeTab.label : null;

  if (standalone) return <FlowContext.Provider value={flowPath}>{children}</FlowContext.Provider>;

  return (
    <>
      <SideMenu>
        <SideBrand>
          <SideBrandLink to={homeRoute}>
            <SideBrandLogo src={logo} alt="Palmeiras Igreja Batista" />
          </SideBrandLink>
        </SideBrand>

        <SideNav>
          <SideNavLink to={NAV_ITEMS.dashboard.path} $active={activePath === NAV_ITEMS.dashboard.path}>
            <DashboardIcon size={18} />
            {NAV_ITEMS.dashboard.label}
          </SideNavLink>
          {navAreas.map((area) => {
            const open = isOpen(area.id);
            return (
              <SideNavArea key={area.title}>
                <SideNavAreaToggle type="button" $open={open} aria-expanded={open} onClick={() => toggleArea(area.id)}>
                  {area.title}
                  <ChevronDown size={14} />
                </SideNavAreaToggle>
                {open && area.tabs.map((item) => renderNavLink(item))}
                {open &&
                  area.more.map((entry) => {
                    if (!isNavGroup(entry)) return renderNavLink(entry);
                    const key = `${area.id}/${entry.id}`;
                    const groupOpen = isOpen(key);
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
      </SideMenu>

      <Main $hasBottomBar={shouldShowBottomBar} $hasModuleBar={showModuleBar}>
        {showModuleBar && (
          <ModuleBar $scrolled={scrolled}>
            <ModuleBarLink to={AppRoute.Dashboard}>
              <ChevronLeft size={20} />
              {moduleBarTitle ?? currentArea.title}
            </ModuleBarLink>
            <ProfileMenu />
          </ModuleBar>
        )}
        <MainInner $profileSlot={showProfileSlot}>
          {showProfileSlot && (
            <ProfileSlot>
              <ProfileAnchor>
                <ProfileMenu />
              </ProfileAnchor>
            </ProfileSlot>
          )}
          <ModuleBarContext.Provider value={setModuleBarHidden}>
            <NavDestinationContext.Provider value={isNavDestination}>
              <ProfileSlotContext.Provider value={showProfileSlot}>
                <ModuleBarTitleContext.Provider value={moduleBarTitle}>{children}</ModuleBarTitleContext.Provider>
              </ProfileSlotContext.Provider>
            </NavDestinationContext.Provider>
          </ModuleBarContext.Provider>
        </MainInner>
      </Main>

      {shouldShowBottomBar && (
        <BottomBar $hidden={bottomBarHidden}>
          {bottomTabs.map((item) => {
            const active = isTabPath(pathname, item.path);
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
