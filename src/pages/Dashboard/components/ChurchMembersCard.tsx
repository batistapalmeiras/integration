// Libs
import { ChevronRight } from 'lucide-react';
// Local
import { COUNTED_MEMBERSHIP_STATUSES } from '../../../domain/memberRecords';
import { useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { listMemberRows } from '../../../repositories/memberRecords';
import { NAV_ITEMS } from '../../../routes/navigation';
import { membersPath } from '../../Members/persistence';
import { ChurchActions, ChurchButton, ChurchCard, ChurchCardIcon, ChurchCardLabel, ChurchCardValue } from '../styles';

const MembersIcon = NAV_ITEMS.members.icon;

export function ChurchMembersCard() {
  const { data, loading } = useQuery(queryKeys.members, listMemberRows);
  const rows = data ?? [];
  const total = rows.filter((member) => COUNTED_MEMBERSHIP_STATUSES.includes(member.membership_status)).length;

  return (
    <ChurchCard aria-labelledby="church">
      <ChurchCardIcon>
        <MembersIcon size={22} />
      </ChurchCardIcon>
      <ChurchCardLabel id="church">Membros</ChurchCardLabel>
      <ChurchCardValue>{loading ? '–' : total}</ChurchCardValue>
      <ChurchActions>
        <ChurchButton to={membersPath({})}>
          Ver todos
          <ChevronRight size={16} aria-hidden="true" />
        </ChurchButton>
      </ChurchActions>
    </ChurchCard>
  );
}
