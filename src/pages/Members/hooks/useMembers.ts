// React
import { useState } from 'react';
// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { pickKeys, useListParams } from '../../../lib/useListParams';
import { AGE_GROUP_NAMES } from '../../../domain/ageGroups';
import { MemberGrouping, pairCouples } from '../../../domain/couples';
import { todayKey } from '../../../domain/dates';
import { RECENT_ACCEPTANCE_LABELS } from '../../../domain/memberAcceptance';
import { MEMBER_FLAG_LABELS } from '../../../domain/memberFlags';
import { GENDER_LABELS, MARITAL_STATUS_LABELS, MEMBERSHIP_STATUS_LABELS } from '../../../domain/memberRecords';
import { MISSING_COMMUNITY_LABELS } from '../../../domain/missingCommunity';
import { ENTRY_TYPE_LABELS } from '../../../types/church';
import { useFamilyTraits } from '../../../queries/person';
import { activeFilterCountOf, DEFAULT_MEMBER_FILTERS, filtersFor, matchesCouple, matchesMember, MemberFilters } from '../filters';
import { MEMBERS_FILTERS, membersFilters } from '../persistence';
import { isMemberSort, MemberSort, memberSortStore, sortByName } from '../sort';
import { listMemberRows } from '../../../repositories/memberRecords';
import { AppRoute } from '../../../routes/paths';

export function useMembers(pageSizeOf: (grouping: MemberGrouping) => number | undefined, couplesAllowed: boolean) {
  const query = useQuery(queryKeys.members, listMemberRows);
  const list = useListParams({
    basePath: AppRoute.Members,
    filters: MEMBERS_FILTERS,
    stored: membersFilters,
    defaults: DEFAULT_MEMBER_FILTERS,
  });
  const grouping: MemberGrouping =
    couplesAllowed && list.filter('grouping').includes('couple') ? 'couple' : 'individual';
  const coupled = grouping === 'couple';
  const [sort, setSortState] = useState<MemberSort>(() => {
    const stored = memberSortStore.load();
    return isMemberSort(stored) ? stored : 'name_asc';
  });
  const traitsQuery = useFamilyTraits(coupled);
  const filters = filtersFor(grouping, {
    status: pickKeys(list.filter('status'), MEMBERSHIP_STATUS_LABELS),
    entryType: pickKeys(list.filter('entryType'), ENTRY_TYPE_LABELS),
    gender: pickKeys(list.filter('gender'), GENDER_LABELS),
    maritalStatus: pickKeys(list.filter('maritalStatus'), MARITAL_STATUS_LABELS),
    ageGroup: pickKeys(list.filter('ageGroup'), AGE_GROUP_NAMES),
    flag: pickKeys(list.filter('flag'), MEMBER_FLAG_LABELS),
    recent: pickKeys(list.filter('recent'), RECENT_ACCEPTANCE_LABELS),
    missing: pickKeys(list.filter('missing'), MISSING_COMMUNITY_LABELS),
  });
  const activeFilterCount = activeFilterCountOf(filters);
  const rows = query.data ?? [];
  const today = todayKey();
  const traits = traitsQuery.data ?? {};

  const members = coupled
    ? []
    : sortByName(
        rows.filter((member) => matchesMember(member, filters, list.debouncedSearch, today)),
        (member) => member.name,
        sort,
      );
  const couples = coupled
    ? sortByName(
        pairCouples(rows, traits).filter((couple) => matchesCouple(couple, filters, list.debouncedSearch)),
        (couple) => couple[0].name,
        sort,
      )
    : [];
  const pageSize = pageSizeOf(grouping);
  const memberPage = list.paginate(members, pageSize);
  const couplePage = list.paginate(couples, pageSize);
  const { page, totalPages } = coupled ? couplePage : memberPage;

  const setSort = (next: MemberSort) => {
    setSortState(next);
    memberSortStore.save(next);
    if (list.page > 1) list.setPage(1);
  };

  return {
    grouping,
    sort,
    setSort,
    members: memberPage.items,
    couples: couplePage.items,
    totalCount: coupled ? couples.length : members.length,
    page,
    totalPages,
    setPage: list.setPage,
    search: list.search,
    setSearch: list.setSearch,
    filters,
    activeFilterCount,
    setFilters: (nextGrouping: MemberGrouping, next: MemberFilters) =>
      list.setFilters({ ...filtersFor(nextGrouping, next), grouping: nextGrouping === 'couple' ? ['couple'] : [] }),
    hasFilter: !!list.search.trim() || activeFilterCount > 0,
    loading: query.loading || (coupled && traitsQuery.loading),
    error: errorMessage(query.error ?? (coupled ? traitsQuery.error : null)),
  };
}
