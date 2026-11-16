// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { pickKeys, useListParams } from '../../../lib/useListParams';
import { matchesNameOrPhone } from '../../../domain/search';
import { AGE_GROUP_NAMES, AgeGroup, ageGroupOf, ageOn } from '../../../domain/ageGroups';
import { todayKey } from '../../../domain/dates';
import { MEMBER_FLAG_LABELS, MemberFlag } from '../../../domain/memberFlags';
import {
  GENDER_LABELS,
  Gender,
  MARITAL_STATUS_LABELS,
  MaritalStatus,
  MEMBERSHIP_STATUS_LABELS,
  MembershipStatus,
} from '../../../domain/memberRecords';
import { ENTRY_TYPE_LABELS, EntryType } from '../../../types/church';
import { MEMBERS_FILTERS, membersFilters } from '../persistence';
import { listMemberRows } from '../../../repositories/memberRecords';
import { AppRoute } from '../../../routes/paths';

export interface MemberFilters {
  status: MembershipStatus[];
  entryType: EntryType[];
  gender: Gender[];
  maritalStatus: MaritalStatus[];
  ageGroup: AgeGroup[];
  flag: MemberFlag[];
}

export function useMembers(pageSize?: number) {
  const query = useQuery(queryKeys.members, listMemberRows);
  const list = useListParams({ basePath: AppRoute.Members, filters: MEMBERS_FILTERS, stored: membersFilters });
  const filters: MemberFilters = {
    status: pickKeys(list.filter('status'), MEMBERSHIP_STATUS_LABELS),
    entryType: pickKeys(list.filter('entryType'), ENTRY_TYPE_LABELS),
    gender: pickKeys(list.filter('gender'), GENDER_LABELS),
    maritalStatus: pickKeys(list.filter('maritalStatus'), MARITAL_STATUS_LABELS),
    ageGroup: pickKeys(list.filter('ageGroup'), AGE_GROUP_NAMES),
    flag: pickKeys(list.filter('flag'), MEMBER_FLAG_LABELS),
  };
  const today = todayKey();
  const activeFilterCount = Object.values(filters).filter((values) => values.length > 0).length;

  const filtered = (query.data ?? []).filter(
    (member) =>
      matchesNameOrPhone(member, list.debouncedSearch) &&
      (filters.status.length === 0 || filters.status.includes(member.membership_status)) &&
      (filters.entryType.length === 0 || (!!member.entry_type && filters.entryType.includes(member.entry_type))) &&
      (filters.gender.length === 0 || (!!member.gender && filters.gender.includes(member.gender))) &&
      (filters.maritalStatus.length === 0 ||
        (!!member.maritalStatus && filters.maritalStatus.includes(member.maritalStatus))) &&
      (filters.ageGroup.length === 0 ||
        (!!member.birthDate && filters.ageGroup.includes(ageGroupOf(ageOn(member.birthDate, today))))) &&
      (filters.flag.length === 0 || member.flags.some((flag) => filters.flag.includes(flag))),
  );
  const { items, page, totalPages } = list.paginate(filtered, pageSize);

  return {
    members: items,
    totalCount: filtered.length,
    page,
    totalPages,
    setPage: list.setPage,
    search: list.search,
    setSearch: list.setSearch,
    filters,
    activeFilterCount,
    setFilters: (next: MemberFilters) => list.setFilters({ ...next }),
    hasFilter: !!list.search.trim() || activeFilterCount > 0,
    loading: query.loading,
    error: errorMessage(query.error),
  };
}
