// React
import { useNavigate } from 'react-router-dom';
// Local
import { AppRoute } from '../../../routes/paths';
import { GroupTable } from '../components/GroupTable';
import { useMinistriesList } from '../hooks/useCommunityGroupsList';

export function MinistriesPage() {
  const navigate = useNavigate();
  const { rows, loading, error, add } = useMinistriesList();

  return (
    <GroupTable
      title="Ministérios"
      fieldLabel="Ministério"
      rows={rows}
      loading={loading}
      error={error}
      onAdd={add}
      onRowClick={(id) => navigate(`${AppRoute.CommunityGroups}/ministerios/${id}`)}
    />
  );
}
