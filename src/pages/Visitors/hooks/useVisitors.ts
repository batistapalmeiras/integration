// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { comparePeopleByPipeline } from '../../../types/person';
import { loadSavedFilters, saveFilters } from '../persistence';
import { Person } from '../../../features/visitors';

export const VISIBLE_STATUSES: Person['status'][] = ['initial_contact', 'retry_contact', 'archived'];
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useVisitors() {
  const [rows, setRows] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [search, setSearchState] = useState(() => loadSavedFilters()?.search ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('people').select('*').in('status', VISIBLE_STATUSES);

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setRows((data as Person[]).sort(comparePeopleByPipeline));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    loading,
    error,
    page: clampedPage,
    totalPages,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    reload: load,
    hasFilter: !!search.trim() || statusFilter.length > 0,
  };
}
