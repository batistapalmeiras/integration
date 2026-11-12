// React
import { useNavigate } from 'react-router-dom';
// Libs
import { HeartHandshake, Users } from 'lucide-react';
// Local
import { BadgeRow, CountBadge, TextBadge } from '../../../components/CountBadge';
import { percentOf } from '../../../domain/communityGroups';
import { AppRoute } from '../../../routes/paths';
import { GroupTable } from '../components/GroupTable';
import { useMemberTotal, useMinistriesList, useMinistryVolunteerCount } from '../hooks/useCommunityGroupsList';

export function MinistriesPage() {
  const navigate = useNavigate();
  const { rows, loading, error, add } = useMinistriesList();
  const volunteerCount = useMinistryVolunteerCount();
  const memberTotal = useMemberTotal();

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
          {volunteerCount !== undefined && memberTotal !== undefined && (
            <TextBadge>{`${percentOf(volunteerCount, memberTotal)}% membros`}</TextBadge>
          )}
        </BadgeRow>
      }
      onAdd={add}
      onRowClick={(id) => navigate(`${AppRoute.CommunityGroups}/ministerios/${id}`)}
    />
  );
}
