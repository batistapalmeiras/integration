// React
import { useNavigate } from 'react-router-dom';
// Libs
import { PageHeader, useAuthCtx } from 'bp-kit';
import { FileBarChart, GraduationCap, UserPlus } from 'lucide-react';
// Local
import { AppRoute } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { MenuOptionCard } from './components/MenuOptionCard';
import { OptionsGrid } from './styles';

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const isAdmin = user?.role === UserRole.Admin;

  return (
    <div>
      <PageHeader title="Menu" subtitle="Opções administrativas" />

      {isAdmin && (
        <OptionsGrid>
          <MenuOptionCard icon={GraduationCap} label="Turmas" onClick={() => navigate(`${AppRoute.Reports}/turmas`)} />
          <MenuOptionCard icon={FileBarChart} label="Relatórios" onClick={() => navigate(AppRoute.Reports)} />
          <MenuOptionCard icon={UserPlus} label="Cadastrar voluntários" onClick={() => navigate(AppRoute.Volunteers)} />
        </OptionsGrid>
      )}
    </div>
  );
}
