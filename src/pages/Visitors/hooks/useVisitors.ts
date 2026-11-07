// React
import { useEffect, useState } from 'react';
// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { comparePeopleByPipeline } from '../../../types/person';
import { loadSavedFilters, saveFilters } from '../persistence';
import { Person } from '../../../features/visitors';

export const VISIBLE_STATUSES: Person['status'][] = ['initial_contact', 'retry_contact', 'archived'];
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

async function listVisitors(): Promise<Person[]> {
  const { data, error } = await supabase.from('people').select('*').in('status', VISIBLE_STATUSES);
  if (error) throw error;
  return (data as Person[]).sort(comparePeopleByPipeline);
}

export function useVisitors() {
  const query = useQuery(queryKeys.visitors, listVisitors);
  const rows = query.data ?? [];
  const [page, setPage] = useState(1);

  const [search, setSearchState] = useState(() => loadSavedFilters()?.search ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(() => (loadSavedFilters()?.search ?? '').trim());
  const [statusFilter, setStatusFilterState] = useState<Person['status'][]>(
    () => loadSavedFilters()?.statusFilter ?? [],
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    saveFilters({ search, statusFilter });
  }, [search, statusFilter]);

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };

  const setStatusFilter = (value: Person['status'][]) => {
    setStatusFilterState(value);
    setPage(1);
  };

  const filtered = rows.filter(
    (person) =>
      (!debouncedSearch || person.name.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
      (statusFilter.length === 0 || statusFilter.includes(person.status)),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return {
    rows: pageRows,
    totalCount: filtered.length,
    loading: query.loading,
    error: errorMessage(query.error),
    page: clampedPage,
    totalPages,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    hasFilter: !!search.trim() || statusFilter.length > 0,
  };
}
