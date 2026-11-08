// React
import { useEffect, useState } from 'react';
// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { useDebouncedSearch } from '../../../lib/useDebouncedSearch';
import { comparePeopleByPipeline } from '../../../types/person';
import { visitorFilters, VisitorView } from '../persistence';
import { Person } from '../../../features/visitors';

export const QUEUE_STATUSES: Person['status'][] = ['initial_contact', 'retry_contact'];
const VISIBLE_STATUSES: Person['status'][] = [...QUEUE_STATUSES, 'archived'];
const PAGE_SIZE = 10;

async function listVisitors(): Promise<Person[]> {
  const { data, error } = await supabase.from('people').select('*').in('status', VISIBLE_STATUSES);
  if (error) throw error;
  return (data as Person[]).sort(comparePeopleByPipeline);
}

export function useVisitors() {
  const query = useQuery(queryKeys.visitors, listVisitors);
  const rows = query.data ?? [];
  const [page, setPage] = useState(1);

  const [saved] = useState(() => visitorFilters.load() ?? {});
  const { search, setSearch: setSearchState, debouncedSearch } = useDebouncedSearch(saved.search ?? '');
  const [view, setViewState] = useState<VisitorView>(saved.view ?? 'queue');
  const [statusFilter, setStatusFilterState] = useState<Person['status'][]>(() =>
    (saved.statusFilter ?? []).filter((status) => QUEUE_STATUSES.includes(status)),
  );

  useEffect(() => {
    visitorFilters.save({ view, search, statusFilter });
  }, [view, search, statusFilter]);

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };

  const setView = (value: VisitorView) => {
    setViewState(value);
    setPage(1);
  };

  const setStatusFilter = (value: Person['status'][]) => {
    setStatusFilterState(value);
    setPage(1);
  };

  const matchesSearch = (person: Person) =>
    !debouncedSearch || person.name.toLowerCase().includes(debouncedSearch.toLowerCase());
  const queue = rows.filter((person) => QUEUE_STATUSES.includes(person.status));
  const archived = rows.filter((person) => person.status === 'archived');
  const filtered = (view === 'queue' ? queue : archived).filter(
    (person) =>
      matchesSearch(person) &&
      (view === 'archived' || statusFilter.length === 0 || statusFilter.includes(person.status)),
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
    view,
    setView,
    queueCount: queue.length,
    archivedCount: archived.length,
    statusFilter,
    setStatusFilter,
    hasFilter: !!search.trim() || (view === 'queue' && statusFilter.length > 0),
  };
}
