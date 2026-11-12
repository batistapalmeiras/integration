// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Users, UsersRound } from 'lucide-react';
// Local
import { BadgeRow, CountBadge, TextBadge } from '../../../components/CountBadge';
import { percentOf } from '../../../domain/communityGroups';
import { AppRoute } from '../../../routes/paths';
import { GroupTable } from '../components/GroupTable';
import { useMemberTotal, useSmallGroupPeopleCount, useSmallGroupsList } from '../hooks/useCommunityGroupsList';

export function SmallGroupsPage() {
  const navigate = useNavigate();
  const { rows, loading, error, add } = useSmallGroupsList();
  const peopleCount = useSmallGroupPeopleCount();
  const memberTotal = useMemberTotal();

  return (
    <GroupTable
      title="Pequenos Grupos"
      fieldLabel="Pequeno Grupo"
      rows={rows}
      loading={loading}
      error={error}
      smallGroup
      counts={
        <BadgeRow>
          {peopleCount !== undefined && memberTotal !== undefined && (
            <TextBadge>{`${percentOf(peopleCount, memberTotal)}% membros`}</TextBadge>
          )}
          <CountBadge icon={UsersRound} count={rows.length} singular="PG" plural="PGs" />
          {peopleCount !== undefined && <CountBadge icon={Users} count={peopleCount} singular="pessoa" plural="pessoas" />}
        </BadgeRow>
      }
      onAdd={add}
      onRowClick={(id) => navigate(`${AppRoute.CommunityGroups}/pgs/${id}`)}
    />
  );
}
