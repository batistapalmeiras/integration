// React
import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Libs
import { useMediaQuery } from 'bp-kit';
import { ChevronLeft, LucideIcon } from 'lucide-react';
// Components
import logo from '../../assets/palmeiras-horizontal-verde.png';
import { useFlowPath } from '../Layout/flow';
import { SideNav, SideNavAreaLabel, SideNavLink, SIDEMENU_MEDIA } from '../Layout/styles';
// Local
import { AppRoute } from '../../routes/paths';
import { BackButton, BrandLink, BrandLogo, Content, Header, Page, SectionMenu, SectionSwitcher, SwitcherLink } from './styles';

export interface SectionItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface Props {
  title: string;
  items: SectionItem[];
  switcher?: boolean;
  children: ReactNode;
}

export function SectionShell({ title, items, switcher = false, children }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const flowPath = useFlowPath();
  const desktop = useMediaQuery(SIDEMENU_MEDIA);

  return (
    <Page>
      <Header>
        <BackButton type="button" onClick={() => navigate(flowPath())}>
          <ChevronLeft size={20} />
          Voltar
        </BackButton>
        <BrandLink to={AppRoute.Dashboard}>
          <BrandLogo src={logo} alt="Palmeiras Igreja Batista" />
        </BrandLink>
      </Header>
      {desktop ? (
        <>
          <SectionMenu>
            <SideNav aria-label={title}>
              <SideNavAreaLabel as="h1">{title}</SideNavAreaLabel>
              {items.map((item) => {
                const active = pathname === item.path;
                return (
                  <SideNavLink
                    key={item.path}
                    to={item.path}
                    replace
                    $active={active}
                    aria-current={active ? 'page' : undefined}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </SideNavLink>
                );
              })}
            </SideNav>
          </SectionMenu>
          <Content>{children}</Content>
        </>
      ) : (
        <>
          <Content>
            {switcher && items.length > 1 && (
              <SectionSwitcher aria-label={title}>
                {items.map((item) => {
                  const active = pathname === item.path;
                  return (
                    <SwitcherLink
                      key={item.path}
                      to={item.path}
                      replace
                      $active={active}
                      aria-current={active ? 'page' : undefined}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </SwitcherLink>
                  );
                })}
              </SectionSwitcher>
            )}
            {children}
          </Content>
        </>
      )}
    </Page>
  );
}
