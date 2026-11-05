// React
import React, { useState } from 'react';
// Libs
import { useMediaQuery } from 'bp-kit';
import {
  ChevronDown,
  ChevronLeft,
  Contact,
  GraduationCap,
  LogOut,
  Menu as MenuIcon,
  Settings,
  User,
  UserCheck,
  Users as UsersIcon,
} from 'lucide-react';
import { Coffee as CoffeeIcon } from 'lucide-react';
// Components
import icon from '../../assets/icon.png';
import {
  activeNavPath,
  areaItems,
  findPastorArea,
  MORE_TAB_ICON,
  MORE_TAB_LABEL,
  NAV_ITEMS,
  NavItem,
  PASTOR_NAV_AREAS,
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
  const {
    user,
    navigate,
    handleLogout,
    isActive,
    isExactTab,
    pathname,
    showDashboard,
    showPeople,
    showVisitors,
    showCoffee,
    showClasses,
    showMembership,
    showAdmin,
    membershipCount,
  } = useLayout();
  const [closedAreas, setClosedAreas] = useState<string[]>([]);

  const toggleArea = (title: string) =>
    setClosedAreas((closed) => (closed.includes(title) ? closed.filter((t) => t !== title) : [...closed, title]));

  const pastorNavPaths = [NAV_ITEMS.dashboard.path, ...PASTOR_NAV_AREAS.flatMap((area) => areaItems(area).map((item) => item.path))];
  const pastorActivePath = activeNavPath(pathname, pastorNavPaths);

  const sidebarPaths = showDashboard
    ? pastorNavPaths
    : ([
        [showAdmin, AppRoute.Settings],
        [showVisitors, AppRoute.Visitors],
        [showCoffee, AppRoute.Coffee],
        [showClasses, AppRoute.Classes],
        [showMembership, AppRoute.Membership],
        [showPeople, AppRoute.People],
      ] as const)
        .filter(([visible]) => visible)
        .map(([, path]) => path as string);
  const hasSidebar = useMediaQuery(SIDEMENU_MEDIA);
  const isSidebarDestination = sidebarPaths.includes(pathname);

  const homeRoute = homeRouteFor(user?.role);

  const showPeopleTab = showPeople && !showAdmin;
  const visibleTabs = [showPeopleTab, showVisitors, showCoffee, showClasses, showMembership, true].filter(Boolean).length;
  const isOnATab =
    (showVisitors && isExactTab(AppRoute.Visitors)) ||
    (showCoffee && isExactTab(AppRoute.Coffee)) ||
    (showClasses && isExactTab(AppRoute.Classes)) ||
    (showMembership && isExactTab(AppRoute.Membership)) ||
    (showPeopleTab && isExactTab(AppRoute.People)) ||
    isExactTab(showAdmin ? AppRoute.Admin : AppRoute.Profile);

  const pastorArea = showDashboard ? findPastorArea(pathname) : undefined;
  const pastorTabs: NavItem[] = pastorArea
    ? [...pastorArea.tabs, { label: MORE_TAB_LABEL, path: pastorArea.morePath, icon: MORE_TAB_ICON }]
    : [
        NAV_ITEMS.dashboard,
        ...PASTOR_NAV_AREAS.map((area) => ({ label: area.title, path: area.tabs[0].path, icon: area.icon })),
        NAV_ITEMS.profile,
      ];
  const isOnPastorTab = !!pastorArea || isExactTab(AppRoute.Dashboard) || isExactTab(AppRoute.Profile);

  const shouldShowBottomBar = showDashboard ? isOnPastorTab : visibleTabs > 1 && isOnATab;
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
          {showDashboard ? (
            <>
              <SideNavLink to={NAV_ITEMS.dashboard.path} $active={pastorActivePath === NAV_ITEMS.dashboard.path}>
                <NAV_ITEMS.dashboard.icon size={18} />
                {NAV_ITEMS.dashboard.label}
              </SideNavLink>
              {PASTOR_NAV_AREAS.map((area) => {
                const open = !closedAreas.includes(area.title);
                return (
                  <SideNavArea key={area.title}>
                    <SideNavAreaToggle type="button" $open={open} aria-expanded={open} onClick={() => toggleArea(area.title)}>
                      {area.title}
                      <ChevronDown size={14} />
                    </SideNavAreaToggle>
                    {open &&
                      areaItems(area).map((item) => (
                        <SideNavLink key={item.path} to={item.path} $active={pastorActivePath === item.path}>
                          <item.icon size={18} />
                          {item.label}
                          {item.path === AppRoute.Membership && membershipCount > 0 && (
                            <SideNavCount>{membershipCount}</SideNavCount>
                          )}
                        </SideNavLink>
                      ))}
                  </SideNavArea>
                );
              })}
            </>
          ) : (
            <>
              {showAdmin && (
                <SideNavLink to={AppRoute.Settings} $active={isActive(AppRoute.Settings)}>
                  <Settings size={18} />
                  Configurações
                </SideNavLink>
              )}
              {showVisitors && (
                <SideNavLink to={AppRoute.Visitors} $active={isActive(AppRoute.Visitors)}>
                  <UsersIcon size={18} />
                  Visitantes
                </SideNavLink>
              )}
              {showCoffee && (
                <SideNavLink to={AppRoute.Coffee} $active={isActive(AppRoute.Coffee)}>
                  <CoffeeIcon size={18} />
                  Café
                </SideNavLink>
              )}
              {showClasses && (
                <SideNavLink to={AppRoute.Classes} $active={isActive(AppRoute.Classes)}>
                  <GraduationCap size={18} />
                  Turmas
                </SideNavLink>
              )}
              {showMembership && (
                <SideNavLink to={AppRoute.Membership} $active={isActive(AppRoute.Membership)}>
                  <UserCheck size={18} />
                  Membresia
                  {membershipCount > 0 && <SideNavCount>{membershipCount}</SideNavCount>}
                </SideNavLink>
              )}
              {showPeople && (
                <SideNavLink to={AppRoute.People} $active={isActive(AppRoute.People)}>
                  <Contact size={18} />
                  Pessoas
                </SideNavLink>
              )}
            </>
          )}
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
        {pastorArea && (
          <ModuleBar to={AppRoute.Dashboard}>
            <ChevronLeft size={20} />
            {pastorArea.title}
          </ModuleBar>
        )}
        <MainInner>
          <NavDestinationContext.Provider value={isNavDestination}>{children}</NavDestinationContext.Provider>
        </MainInner>
      </Main>

      {shouldShowBottomBar && (
        <BottomBar>
          {showDashboard ? (
            pastorTabs.map((item) => {
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
            })
          ) : (
            <>
              {showVisitors && (
                <BottomTab to={AppRoute.Visitors} $active={isActive(AppRoute.Visitors)}>
                  <UsersIcon size={22} />
                  <BottomTabLabel $active={isActive(AppRoute.Visitors)}>Visitantes</BottomTabLabel>
                </BottomTab>
              )}
              {showCoffee && (
                <BottomTab to={AppRoute.Coffee} $active={isActive(AppRoute.Coffee)}>
                  <CoffeeIcon size={22} />
                  <BottomTabLabel $active={isActive(AppRoute.Coffee)}>Café</BottomTabLabel>
                </BottomTab>
              )}
              {showClasses && (
                <BottomTab to={AppRoute.Classes} $active={isActive(AppRoute.Classes)}>
                  <GraduationCap size={22} />
                  <BottomTabLabel $active={isActive(AppRoute.Classes)}>Turmas</BottomTabLabel>
                </BottomTab>
              )}
              {showMembership && (
                <BottomTab to={AppRoute.Membership} $active={isActive(AppRoute.Membership)}>
                  <TabIcon>
                    <UserCheck size={22} />
                    {membershipCount > 0 && <TabCount>{membershipCount}</TabCount>}
                  </TabIcon>
                  <BottomTabLabel $active={isActive(AppRoute.Membership)}>Membresia</BottomTabLabel>
                </BottomTab>
              )}
              {showPeopleTab && (
                <BottomTab to={AppRoute.People} $active={isActive(AppRoute.People)}>
                  <Contact size={22} />
                  <BottomTabLabel $active={isActive(AppRoute.People)}>Pessoas</BottomTabLabel>
                </BottomTab>
              )}
              {showAdmin ? (
                <BottomTab to={AppRoute.Admin} $active={isActive(AppRoute.Admin)}>
                  <MenuIcon size={22} />
                  <BottomTabLabel $active={isActive(AppRoute.Admin)}>Menu</BottomTabLabel>
                </BottomTab>
              ) : (
                <BottomTab to={AppRoute.Profile} $active={isActive(AppRoute.Profile)}>
                  <User size={22} />
                  <BottomTabLabel $active={isActive(AppRoute.Profile)}>Meu perfil</BottomTabLabel>
                </BottomTab>
              )}
            </>
          )}
        </BottomBar>
      )}
    </>
  );
}
