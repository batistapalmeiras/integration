// React
import { useNavigate } from 'react-router-dom';
// Libs
import { UsersRound } from 'lucide-react';
// Local
import { CountBadge } from '../../../components/CountBadge';
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
      smallGroup
      counts={<CountBadge icon={UsersRound} count={rows.length} singular="PG" plural="PGs" />}
      onAdd={add}
      onRowClick={(id) => navigate(`${AppRoute.CommunityGroups}/pgs/${id}`)}
    />
  );
}
