// React
import { useEffect, useState } from 'react';
// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { matchesNameOrPhone } from '../../../domain/search';
import { useDebouncedSearch } from '../../../lib/useDebouncedSearch';
import { MembershipStatus } from '../../../domain/memberRecords';
import { EntryType } from '../../../types/church';
import { membersFilters } from '../persistence';
import { listMemberRows } from '../../../repositories/memberRecords';

const PAGE_SIZE = 10;

export function useMembers() {
  const query = useQuery(queryKeys.members, listMemberRows);
  const members = query.data ?? [];
  const [page, setPage] = useState(1);
  const [saved] = useState(() => membersFilters.load() ?? {});
  const { search, setSearch: setSearchState, debouncedSearch } = useDebouncedSearch(saved.search ?? '');
  const [membershipStatusFilter, setMembershipStatusFilterState] = useState<MembershipStatus[]>(
    saved.membershipStatusFilter ?? [],
  );
  const [entryTypeFilter, setEntryTypeFilterState] = useState<EntryType[]>(saved.entryTypeFilter ?? []);

  useEffect(() => {
    membersFilters.save({ search, membershipStatusFilter, entryTypeFilter });
  }, [search, membershipStatusFilter, entryTypeFilter]);

  const resetPage =
    <T>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const filtered = members.filter(
    (member) =>
      matchesNameOrPhone(member, debouncedSearch) &&
      (membershipStatusFilter.length === 0 || membershipStatusFilter.includes(member.membership_status)) &&
      (entryTypeFilter.length === 0 || (!!member.entry_type && entryTypeFilter.includes(member.entry_type))),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  return {
    members: filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    totalCount: filtered.length,
    page: currentPage,
    totalPages,
    setPage,
    search,
    setSearch: resetPage(setSearchState),
    membershipStatusFilter,
    setMembershipStatusFilter: resetPage(setMembershipStatusFilterState),
    entryTypeFilter,
    setEntryTypeFilter: resetPage(setEntryTypeFilterState),
    hasFilter: !!search.trim() || membershipStatusFilter.length > 0 || entryTypeFilter.length > 0,
    loading: query.loading,
    error: errorMessage(query.error),
  };
}
