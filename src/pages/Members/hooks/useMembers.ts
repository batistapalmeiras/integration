// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { pickKeys, useListParams } from '../../../lib/useListParams';
import { matchesNameOrPhone } from '../../../domain/search';
import { MEMBERSHIP_STATUS_LABELS, MembershipStatus } from '../../../domain/memberRecords';
import { ENTRY_TYPE_LABELS, EntryType } from '../../../types/church';
import { MEMBERS_FILTERS, membersFilters } from '../persistence';
import { listMemberRows } from '../../../repositories/memberRecords';
import { AppRoute } from '../../../routes/paths';

export function useMembers() {
  const query = useQuery(queryKeys.members, listMemberRows);
  const list = useListParams({ basePath: AppRoute.Members, filters: MEMBERS_FILTERS, stored: membersFilters });
  const membershipStatusFilter = pickKeys(list.filter('status'), MEMBERSHIP_STATUS_LABELS);
  const entryTypeFilter = pickKeys(list.filter('entryType'), ENTRY_TYPE_LABELS);

  const filtered = (query.data ?? []).filter(
    (member) =>
      matchesNameOrPhone(member, list.debouncedSearch) &&
      (membershipStatusFilter.length === 0 || membershipStatusFilter.includes(member.membership_status)) &&
      (entryTypeFilter.length === 0 || (!!member.entry_type && entryTypeFilter.includes(member.entry_type))),
  );
  const { items, page, totalPages } = list.paginate(filtered);

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
    setFilters: (status: MembershipStatus[], entryType: EntryType[]) => list.setFilters({ status, entryType }),
    hasFilter: !!list.search.trim() || membershipStatusFilter.length > 0 || entryTypeFilter.length > 0,
    loading: query.loading,
    error: errorMessage(query.error),
  };
}
