// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { MembershipStatus } from '../../../domain/memberRecords';
import { EntryType } from '../../../types/church';
import { loadSavedFilters, saveFilters } from '../persistence';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export interface MemberRow {
  id: string;
  name: string;
  entry_type: EntryType | null;
  membership_status: MembershipStatus;
}

export function useMembers() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState(() => loadSavedFilters()?.search ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from('people')
      .select('id, name, entry_type, membership_status')
      .eq('status', 'member')
      .order('name', { ascending: true });

    if (loadError) setError(loadError.message);
    else setMembers((data ?? []) as MemberRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    loading,
    error,
  };
}
