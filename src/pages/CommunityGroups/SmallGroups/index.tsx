// React
import { useNavigate } from 'react-router-dom';
// Local
import { AppRoute } from '../../../routes/paths';
import { GroupTable } from '../components/GroupTable';
import { useSmallGroupsList } from '../hooks/useCommunityGroupsList';

export function SmallGroupsPage() {
  const navigate = useNavigate();
  const { rows, loading, error, add } = useSmallGroupsList();

  return (
    <GroupTable
      title="Pequenos Grupos"
      fieldLabel="Pequeno Grupo"
      rows={rows}
      loading={loading}
      error={error}
      hasHosts
      onAdd={add}
      onRowClick={(id) => navigate(`${AppRoute.CommunityGroups}/pgs/${id}`)}
    />
  );
}
