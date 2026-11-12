// React
import { useNavigate } from 'react-router-dom';
// Libs
import { HeartHandshake, Users } from 'lucide-react';
// Local
import { BadgeRow, CountBadge } from '../../../components/CountBadge';
import { AppRoute } from '../../../routes/paths';
import { GroupTable } from '../components/GroupTable';
import { useMinistriesList, useMinistryVolunteerCount } from '../hooks/useCommunityGroupsList';

export function MinistriesPage() {
  const navigate = useNavigate();
  const { rows, loading, error, add } = useMinistriesList();
  const volunteerCount = useMinistryVolunteerCount();

  return (
    <GroupTable
      title="Ministérios"
      fieldLabel="Ministério"
      rows={rows}
      loading={loading}
      error={error}
      counts={
        <BadgeRow>
          <CountBadge icon={HeartHandshake} count={rows.length} singular="ministério" plural="ministérios" />
          {volunteerCount !== undefined && (
            <CountBadge icon={Users} count={volunteerCount} singular="voluntário" plural="voluntários" />
          )}
        </BadgeRow>
      }
      onAdd={add}
      onRowClick={(id) => navigate(`${AppRoute.CommunityGroups}/ministerios/${id}`)}
    />
  );
}
