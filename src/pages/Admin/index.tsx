// React
import { useNavigate } from 'react-router-dom';
// Libs
import { PageHeader, useAuthCtx } from 'bp-kit';
import { ChevronRight } from 'lucide-react';
// Local
import icon from '../../assets/icon.png';
import { NAV_ITEMS } from '../../routes/navigation';
import { AppRoute } from '../../routes/paths';
import { hasRole, LEADERSHIP_ROLES, ROLE_LABELS, UserRole } from '../../types/enums';
import { MenuOptionCard } from './components/MenuOptionCard';
import {
  Avatar,
  DesktopTitle,
  MenuSection,
  MenuSectionTitle,
  MobileBrand,
  MobileBrandLogo,
  MobileBrandName,
  MobileMenu,
  OptionsGrid,
  ProfileCard,
  ProfileInfo,
  ProfileName,
  ProfileRole,
} from './styles';

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();

  const isPastor = user?.role === UserRole.Pastor;
  const canManageOperations = hasRole(user?.role, LEADERSHIP_ROLES);

  const firstInitial = user?.name?.trim().charAt(0).toUpperCase() ?? '?';

  return (
    <div>
      <MobileMenu>
        <MobileBrand>
          <MobileBrandLogo src={icon} alt="Batista Palmeiras" />
          <MobileBrandName>Integração</MobileBrandName>
        </MobileBrand>

        <ProfileCard $hoverable role="button" tabIndex={0} onClick={() => navigate(AppRoute.Profile)}>
          <Avatar>{firstInitial}</Avatar>
          <ProfileInfo>
            <ProfileName>{user?.name}</ProfileName>
            <ProfileRole>{user ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : ''}</ProfileRole>
          </ProfileInfo>
          <ChevronRight size={18} />
        </ProfileCard>
      </MobileMenu>

      <DesktopTitle>
        <PageHeader title="Configurações" />
      </DesktopTitle>

      {canManageOperations && (
        <MenuSection>
          <MenuSectionTitle>Igreja</MenuSectionTitle>
          <OptionsGrid>
            <MenuOptionCard icon={NAV_ITEMS.members.icon} label={NAV_ITEMS.members.label} onClick={() => navigate(NAV_ITEMS.members.path)} />
            {isPastor && (
              <>
                <MenuOptionCard icon={NAV_ITEMS.dashboard.icon} label={NAV_ITEMS.dashboard.label} onClick={() => navigate(NAV_ITEMS.dashboard.path)} />
                <MenuOptionCard icon={NAV_ITEMS.pendencies.icon} label={NAV_ITEMS.pendencies.label} onClick={() => navigate(NAV_ITEMS.pendencies.path)} />
                <MenuOptionCard icon={NAV_ITEMS.ministries.icon} label={NAV_ITEMS.ministries.label} onClick={() => navigate(NAV_ITEMS.ministries.path)} />
                <MenuOptionCard icon={NAV_ITEMS.smallGroups.icon} label={NAV_ITEMS.smallGroups.label} onClick={() => navigate(NAV_ITEMS.smallGroups.path)} />
              </>
            )}
          </OptionsGrid>
        </MenuSection>
      )}

      {canManageOperations && (
        <MenuSection>
          <MenuSectionTitle>Integração</MenuSectionTitle>
          <OptionsGrid>
            <MenuOptionCard icon={NAV_ITEMS.people.icon} label={NAV_ITEMS.people.label} onClick={() => navigate(NAV_ITEMS.people.path)} />
            <MenuOptionCard icon={NAV_ITEMS.cohortHistory.icon} label={NAV_ITEMS.cohortHistory.label} onClick={() => navigate(NAV_ITEMS.cohortHistory.path)} />
            <MenuOptionCard icon={NAV_ITEMS.coffeeHistory.icon} label={NAV_ITEMS.coffeeHistory.label} onClick={() => navigate(NAV_ITEMS.coffeeHistory.path)} />
            <MenuOptionCard icon={NAV_ITEMS.volunteers.icon} label={NAV_ITEMS.volunteers.label} onClick={() => navigate(NAV_ITEMS.volunteers.path)} />
            <MenuOptionCard icon={NAV_ITEMS.reports.icon} label={NAV_ITEMS.reports.label} onClick={() => navigate(NAV_ITEMS.reports.path)} />
          </OptionsGrid>
        </MenuSection>
      )}

      {isPastor && (
        <MenuSection>
          <MenuSectionTitle>Loja</MenuSectionTitle>
          <OptionsGrid>
            <MenuOptionCard icon={NAV_ITEMS.store.icon} label={NAV_ITEMS.store.label} disabled />
          </OptionsGrid>
        </MenuSection>
      )}
    </div>
  );
}
