// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { comparePeopleByPipeline } from '../../../types/person';
import { loadSavedFilters, saveFilters } from '../persistence';
import { Person } from '../types';

// This page is the "contact" stage queue: once a person moves past it
// (welcome_coffee onward) they belong to the next volunteer's stage and
// stop showing up here. Archived people stay visible since reactivating
// always sends them back into this same contact queue.
const VISIBLE_STATUSES: Person['status'][] = ['initial_contact', 'retry_contact', 'archived'];
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useVisitors() {
  const [allPeople, setAllPeople] = useState<Person[]>([]);
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
    } else {
      setAllPeople((data as Person[]).sort(comparePeopleByPipeline));
      setPage(1);
    }
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

  const filtered = allPeople
    .filter((p) => statusFilter.length === 0 || statusFilter.includes(p.status))
    .filter((p) => !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const people = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return {
    people,
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
    hasFilter: !!search.trim() || statusFilter.length > 0,
  };
}
