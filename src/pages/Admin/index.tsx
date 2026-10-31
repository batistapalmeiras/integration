// React
import { useNavigate } from 'react-router-dom';
// Libs
import { PageHeader, useAuthCtx } from 'bp-kit';
import {
  ChevronRight,
  Contact,
  FileBarChart,
  GraduationCap,
  HeartHandshake,
  Store,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react';
// Local
import icon from '../../assets/icon.png';
import { AppRoute } from '../../routes/paths';
import { ROLE_LABELS, UserRole } from '../../types/enums';
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

  const isAdmin = user?.role === UserRole.Admin;
  const isPastor = user?.role === UserRole.Pastor;
  const canManageOperations = isAdmin || isPastor;

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
            <MenuOptionCard icon={Users} label="Membros" onClick={() => navigate(AppRoute.Members)} />
            {isPastor && (
              <>
                <MenuOptionCard icon={HeartHandshake} label="Ministérios" onClick={() => navigate(AppRoute.Ministries)} />
                <MenuOptionCard icon={UsersRound} label="Pequenos Grupos" onClick={() => navigate(AppRoute.SmallGroups)} />
              </>
            )}
          </OptionsGrid>
        </MenuSection>
      )}

      {canManageOperations && (
        <MenuSection>
          <MenuSectionTitle>Integração</MenuSectionTitle>
          <OptionsGrid>
            <MenuOptionCard icon={Contact} label="Pessoas" onClick={() => navigate(AppRoute.People)} />
            <MenuOptionCard icon={GraduationCap} label="Histórico de turmas" onClick={() => navigate(`${AppRoute.Reports}/turmas`)} />
            <MenuOptionCard icon={UserPlus} label="Voluntários" onClick={() => navigate(AppRoute.Volunteers)} />
            <MenuOptionCard icon={FileBarChart} label="Relatórios" onClick={() => navigate(AppRoute.Reports)} />
          </OptionsGrid>
        </MenuSection>
      )}

      {isPastor && (
        <MenuSection>
          <MenuSectionTitle>Loja</MenuSectionTitle>
          <OptionsGrid>
            <MenuOptionCard icon={Store} label="Loja" disabled />
          </OptionsGrid>
        </MenuSection>
      )}
    </div>
  );
}
