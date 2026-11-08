// React
import { Navigate, useNavigate } from 'react-router-dom';
// Libs
import { useAuthCtx } from 'bp-kit';
// Components
import { MenuOptionCard, OptionsGrid } from '../../components/MenuOptions';
import { PageHeader } from '../../components/PageHeader';
import { findNavAreaById, navAreasFor } from '../../routes/navigation';
import { AppRoute } from '../../routes/paths';

interface Props {
  areaId: string;
}

export function ModuleMorePage({ areaId }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const area = findNavAreaById(navAreasFor(user?.role), areaId);

  if (!area) return <Navigate to={AppRoute.Dashboard} replace />;

  return (
    <div>
      <PageHeader title={area.title} />
      <OptionsGrid>
        {area.more.map((item) => (
          <MenuOptionCard key={item.path} icon={item.icon} label={item.label} onClick={() => navigate(item.path)} />
        ))}
      </OptionsGrid>
    </div>
  );
}
