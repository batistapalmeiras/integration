// React
import { useEffect, useState } from 'react';
// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { MembershipStatus } from '../../../domain/memberRecords';
import { EntryType } from '../../../types/church';
import { loadSavedFilters, saveFilters } from '../persistence';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

interface MemberRow {
  id: string;
  name: string;
  entry_type: EntryType | null;
  membership_status: MembershipStatus;
}

async function listMemberRows(): Promise<MemberRow[]> {
  const { data, error } = await supabase
    .from('people')
    .select('id, name, entry_type, membership_status')
    .eq('status', 'member')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MemberRow[];
}

export function useMembers() {
  const query = useQuery(queryKeys.members, listMemberRows);
  const members = query.data ?? [];
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState(() => loadSavedFilters()?.search ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(() => (loadSavedFilters()?.search ?? '').trim().toLowerCase());
  const [membershipStatusFilter, setMembershipStatusFilterState] = useState<MembershipStatus[]>(
    () => loadSavedFilters()?.membershipStatusFilter ?? [],
  );
  const [entryTypeFilter, setEntryTypeFilterState] = useState<EntryType[]>(
    () => loadSavedFilters()?.entryTypeFilter ?? [],
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    saveFilters({ search, membershipStatusFilter, entryTypeFilter });
  }, [search, membershipStatusFilter, entryTypeFilter]);

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const filtered = members.filter(
    (member) =>
      (!debouncedSearch || member.name.toLowerCase().includes(debouncedSearch)) &&
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
