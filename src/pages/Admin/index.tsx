// React
import { useNavigate } from 'react-router-dom';
// Libs
import { PageHeader, useAuthCtx } from 'bp-kit';
import { FileBarChart, GraduationCap, HeartHandshake, UserPlus, Users, UsersRound } from 'lucide-react';
// Local
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { MenuOptionCard } from './components/MenuOptionCard';
import { OptionsGrid } from './styles';

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();

  const isAdmin = user?.role === UserRole.Admin;
  const isPastor = user?.role === UserRole.Pastor;
  const canManageOperations = isAdmin || isPastor;

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Opções administrativas" />

      <OptionsGrid>
        {canManageOperations && (
          <>
            <MenuOptionCard icon={GraduationCap} label="Turmas" onClick={() => navigate(`${AppRoute.Reports}/turmas`)} />
            <MenuOptionCard icon={FileBarChart} label="Relatórios" onClick={() => navigate(AppRoute.Reports)} />
            <MenuOptionCard icon={UserPlus} label="Cadastrar voluntários" onClick={() => navigate(AppRoute.Volunteers)} />
            <MenuOptionCard icon={Users} label="Membros" onClick={() => navigate(AppRoute.Members)} />
          </>
        )}
        {/* Ministérios/PGs são exclusivos do Pastor — estrutura da igreja, não do pipeline de integração. */}
        {isPastor && (
          <>
            <MenuOptionCard icon={HeartHandshake} label="Ministérios" onClick={() => navigate(AppRoute.Ministries)} />
            <MenuOptionCard icon={UsersRound} label="Pequenos Grupos" onClick={() => navigate(AppRoute.SmallGroups)} />
          </>
        )}
      </OptionsGrid>
    </div>
  );
}
