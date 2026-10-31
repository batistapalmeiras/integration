// React
import React from 'react';
// Libs
import {
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
import { AppRoute } from '../../routes/paths';
import { ROLE_LABELS } from '../../types/enums';
// Local
import { useLayout } from './hooks';
import {
  BottomBar,
  BottomTab,
  BottomTabLabel,
  DropdownItem,
  Main,
  MainInner,
  SideBrand,
  SideBrandLink,
  SideBrandLogo,
  SideBrandName,
  SideFooter,
  SideMenu,
  SideNav,
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
    showPeople,
    showVisitors,
    showCoffee,
    showClasses,
    showMembership,
    showAdmin,
    membershipCount,
  } = useLayout();

  const homeRoute =
    ([
      [showVisitors, AppRoute.Visitors],
      [showCoffee, AppRoute.Coffee],
      [showClasses, AppRoute.Classes],
      [showAdmin, AppRoute.Settings],
    ] as const).find(([visible]) => visible)?.[1] ?? AppRoute.People;

  const showPeopleTab = showPeople && !showAdmin;
  const visibleTabs = [showPeopleTab, showVisitors, showCoffee, showClasses, showMembership, true].filter(Boolean).length;
  const isOnATab =
    (showVisitors && isExactTab(AppRoute.Visitors)) ||
    (showCoffee && isExactTab(AppRoute.Coffee)) ||
    (showClasses && isExactTab(AppRoute.Classes)) ||
    (showMembership && isExactTab(AppRoute.Membership)) ||
    (showPeopleTab && isExactTab(AppRoute.People)) ||
    isExactTab(showAdmin ? AppRoute.Admin : AppRoute.Profile);

  const shouldShowBottomBar = visibleTabs > 1 && isOnATab;

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
        <MainInner>{children}</MainInner>
      </Main>

      {shouldShowBottomBar && (
        <BottomBar>
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
        </BottomBar>
      )}
    </>
  );
}
