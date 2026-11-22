// Libs
import { ChevronRight } from 'lucide-react';
// Local
import { COUNTED_MEMBERSHIP_STATUSES } from '../../../domain/memberRecords';
import { isRecentlyAccepted, RECENT_ACCEPTANCE_MONTHS } from '../../../domain/memberAcceptance';
import { todayKey } from '../../../domain/dates';
import { useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { listMemberRows } from '../../../repositories/memberRecords';
import { NAV_ITEMS } from '../../../routes/navigation';
import { membersFilters, membersPath } from '../../Members/persistence';
import { ChurchActions, ChurchButton, ChurchCard, ChurchCardIcon, ChurchCardLabel, ChurchCardValue, ChurchRecent } from '../styles';

const MembersIcon = NAV_ITEMS.members.icon;

export function ChurchMembersCard() {
  const { data, loading } = useQuery(queryKeys.members, listMemberRows);
  const today = todayKey();
  const rows = data ?? [];
  const total = rows.filter((member) => COUNTED_MEMBERSHIP_STATUSES.includes(member.membership_status)).length;
  const recent = rows.filter((member) => isRecentlyAccepted(member.acceptedOn, today)).length;

  return (
    <ChurchCard aria-labelledby="church">
      <ChurchCardIcon>
        <MembersIcon size={22} />
      </ChurchCardIcon>
      <ChurchCardLabel id="church">Membros</ChurchCardLabel>
      <ChurchCardValue>{loading ? '–' : total}</ChurchCardValue>
      {!loading && (
        <ChurchRecent>
          {recent} {recent === 1 ? 'aceito' : 'aceitos'} nos últimos {RECENT_ACCEPTANCE_MONTHS} meses
        </ChurchRecent>
      )}
      <ChurchActions>
        {recent > 0 && (
          <ChurchButton to={membersPath({ recent: ['recent'] })}>
            Ver {recent === 1 ? 'o aceito' : `os ${recent} aceitos`}
            <ChevronRight size={16} aria-hidden="true" />
          </ChurchButton>
        )}
        <ChurchButton to={membersPath({})} onClick={() => membersFilters.save({})}>
          Ver todos
          <ChevronRight size={16} aria-hidden="true" />
        </ChurchButton>
      </ChurchActions>
    </ChurchCard>
  );
}
