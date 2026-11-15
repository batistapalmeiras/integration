// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { pickKeys, useListParams } from '../../../lib/useListParams';
import { matchesNameOrPhone } from '../../../domain/search';
import { MEMBER_FLAG_LABELS, MemberFlag } from '../../../domain/memberFlags';
import { MEMBERSHIP_STATUS_LABELS, MembershipStatus } from '../../../domain/memberRecords';
import { ENTRY_TYPE_LABELS, EntryType } from '../../../types/church';
import { MEMBERS_FILTERS, membersFilters } from '../persistence';
import { listMemberRows } from '../../../repositories/memberRecords';
import { AppRoute } from '../../../routes/paths';

export function useMembers(pageSize?: number) {
  const query = useQuery(queryKeys.members, listMemberRows);
  const list = useListParams({ basePath: AppRoute.Members, filters: MEMBERS_FILTERS, stored: membersFilters });
  const membershipStatusFilter = pickKeys(list.filter('status'), MEMBERSHIP_STATUS_LABELS);
  const entryTypeFilter = pickKeys(list.filter('entryType'), ENTRY_TYPE_LABELS);
  const flagFilter = pickKeys(list.filter('flag'), MEMBER_FLAG_LABELS);

  const filtered = (query.data ?? []).filter(
    (member) =>
      matchesNameOrPhone(member, list.debouncedSearch) &&
      (membershipStatusFilter.length === 0 || membershipStatusFilter.includes(member.membership_status)) &&
      (entryTypeFilter.length === 0 || (!!member.entry_type && entryTypeFilter.includes(member.entry_type))) &&
      (flagFilter.length === 0 || member.flags.some((flag) => flagFilter.includes(flag))),
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
    membershipStatusFilter,
    entryTypeFilter,
    flagFilter,
    setFilters: (status: MembershipStatus[], entryType: EntryType[], flag: MemberFlag[]) =>
      list.setFilters({ status, entryType, flag }),
    hasFilter:
      !!list.search.trim() || membershipStatusFilter.length > 0 || entryTypeFilter.length > 0 || flagFilter.length > 0,
    loading: query.loading,
    error: errorMessage(query.error),
  };
}
