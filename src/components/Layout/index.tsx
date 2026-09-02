// React
import React from 'react';
// Libs
import { Brand } from 'bp-kit';
import { Contact, GraduationCap, LogOut, Menu as MenuIcon, Settings, User, Users as UsersIcon } from 'lucide-react';
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
  SideFooter,
  SideMenu,
  SideNav,
  SideNavLink,
  SideUserInfo,
  SideUserName,
  SideUserRole,
} from './styles';

interface ILayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: ILayoutProps) {
  const { user, navigate, handleLogout, isActive, showPeople, showVisitors, showCoffee, showClasses, showAdmin } =
    useLayout();

  // The Brand/home link only ever renders on desktop (SideBrand), so it
  // should match the desktop sidebar's own route for this page (/configuracoes),
  // not the mobile bottom-tab one (/menu).
  const homeRoute =
    ([
      [showVisitors, AppRoute.Visitors],
      [showCoffee, AppRoute.Coffee],
      [showClasses, AppRoute.Classes],
      [showAdmin, AppRoute.Settings],
    ] as const).find(([visible]) => visible)?.[1] ?? AppRoute.People;

  // The Menu tab (profile/logout + admin shortcuts) is always available —
  // it's every role's only way to reach "Meu perfil"/"Sair" on mobile now
  // that there's no top bar, not just an admin shortcut.
  const visibleTabs = [showPeople, showVisitors, showCoffee, showClasses, true].filter(Boolean).length;
  const isOnATab =
    (showVisitors && isActive(AppRoute.Visitors)) ||
    (showCoffee && isActive(AppRoute.Coffee)) ||
    (showClasses && isActive(AppRoute.Classes)) ||
    (showPeople && isActive(AppRoute.People)) ||
    isActive(AppRoute.Admin);

  const shouldShowBottomBar = visibleTabs > 1 && isOnATab;

  return (
    <>
      <SideMenu>
        <SideBrand>
          <Brand to={homeRoute} icon={icon} alt="Batista Palmeiras" name="Integração" />
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
              Turma
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
              <BottomTabLabel $active={isActive(AppRoute.Classes)}>Turma</BottomTabLabel>
            </BottomTab>
          )}
          {showPeople && (
            <BottomTab to={AppRoute.People} $active={isActive(AppRoute.People)}>
              <Contact size={22} />
              <BottomTabLabel $active={isActive(AppRoute.People)}>Pessoas</BottomTabLabel>
            </BottomTab>
          )}
          <BottomTab to={AppRoute.Admin} $active={isActive(AppRoute.Admin)}>
            <MenuIcon size={22} />
            <BottomTabLabel $active={isActive(AppRoute.Admin)}>Menu</BottomTabLabel>
          </BottomTab>
        </BottomBar>
      )}
    </>
  );
}
