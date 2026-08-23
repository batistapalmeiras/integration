// React
import React from 'react';
// Libs
import { Brand } from 'bp-kit';
import { Contact, GraduationCap, LogOut, Menu as MenuIcon, User, UserCircle, Users as UsersIcon } from 'lucide-react';
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
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  DropdownName,
  DropdownRole,
  Header,
  HeaderInner,
  Main,
  MainInner,
  Nav,
  NavLink,
  UserArea,
  UserBtn,
} from './styles';

interface ILayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: ILayoutProps) {
  const {
    user,
    navigate,
    open,
    setOpen,
    ref,
    handleLogout,
    isActive,
    showPeople,
    showVisitors,
    showCoffee,
    showClasses,
    showAdmin,
  } = useLayout();

  const homeRoute = showVisitors
    ? AppRoute.Visitors
    : showCoffee
      ? AppRoute.Coffee
      : showClasses
        ? AppRoute.Classes
        : showAdmin
          ? AppRoute.Admin
          : AppRoute.People;

  const visibleTabs = [showPeople, showVisitors, showCoffee, showClasses, showAdmin].filter(Boolean).length;

  // Sub-pages reached through Menu (Relatórios, Turmas, Voluntários, etc.)
  // aren't any tab's own screen — the bar would just sit there with nothing
  // lit up, so hide it entirely instead.
  const isOnATab =
    (showVisitors && isActive(AppRoute.Visitors)) ||
    (showCoffee && isActive(AppRoute.Coffee)) ||
    (showClasses && isActive(AppRoute.Classes)) ||
    (showPeople && isActive(AppRoute.People)) ||
    (showAdmin && isActive(AppRoute.Admin));

  const shouldShowBottomBar = visibleTabs > 1 && isOnATab;

  return (
    <>
      <Header>
        <HeaderInner>
          <Brand to={homeRoute} icon={icon} alt="Batista Palmeiras" name="Integração" />

          <Nav>
            {showVisitors && (
              <NavLink to={AppRoute.Visitors} $active={isActive(AppRoute.Visitors)}>
                Visitantes
              </NavLink>
            )}
            {showCoffee && (
              <NavLink to={AppRoute.Coffee} $active={isActive(AppRoute.Coffee)}>
                Café
              </NavLink>
            )}
            {showClasses && (
              <NavLink to={AppRoute.Classes} $active={isActive(AppRoute.Classes)}>
                Turma
              </NavLink>
            )}
            {showPeople && (
              <NavLink to={AppRoute.People} $active={isActive(AppRoute.People)}>
                Pessoas
              </NavLink>
            )}
            {showAdmin && (
              <NavLink to={AppRoute.Admin} $active={isActive(AppRoute.Admin)}>
                Menu
              </NavLink>
            )}
          </Nav>

          <UserArea ref={ref}>
            <UserBtn onClick={() => setOpen((v) => !v)}>
              <UserCircle size={20} />
              <span>{user?.name?.split(' ')[0]}</span>
            </UserBtn>

            <Dropdown $open={open}>
              <DropdownHeader>
                <DropdownName>{user?.name}</DropdownName>
                <DropdownRole>{user ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : ''}</DropdownRole>
              </DropdownHeader>
              <DropdownItem
                onClick={() => {
                  setOpen(false);
                  navigate(AppRoute.Profile);
                }}
              >
                <User size={16} />
                Meu perfil
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem className="danger" onClick={handleLogout}>
                <LogOut size={16} />
                Sair
              </DropdownItem>
            </Dropdown>
          </UserArea>
        </HeaderInner>
      </Header>

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
          {showAdmin && (
            <BottomTab to={AppRoute.Admin} $active={isActive(AppRoute.Admin)}>
              <MenuIcon size={22} />
              <BottomTabLabel $active={isActive(AppRoute.Admin)}>Menu</BottomTabLabel>
            </BottomTab>
          )}
        </BottomBar>
      )}
    </>
  );
}
