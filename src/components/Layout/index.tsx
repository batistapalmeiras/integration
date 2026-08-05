// React
import React from 'react';
// Libs
import { Brand } from 'bp-kit';
import { GraduationCap, LogOut, ShieldCheck, User, UserCircle, Users as UsersIcon } from 'lucide-react';
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
        : AppRoute.Admin;

  const visibleTabs = [showVisitors, showCoffee, showClasses, showAdmin].filter(Boolean).length;
  const shouldShowBottomBar = visibleTabs > 1;

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
            {showAdmin && (
              <NavLink to={AppRoute.Admin} $active={isActive(AppRoute.Admin)}>
                Admin
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

      <Main>
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
          {showAdmin && (
            <BottomTab to={AppRoute.Admin} $active={isActive(AppRoute.Admin)}>
              <ShieldCheck size={22} />
              <BottomTabLabel $active={isActive(AppRoute.Admin)}>Admin</BottomTabLabel>
            </BottomTab>
          )}
        </BottomBar>
      )}
    </>
  );
}
