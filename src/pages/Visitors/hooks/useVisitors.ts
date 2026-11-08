// React
import { useEffect, useState } from 'react';
// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { useDebouncedSearch } from '../../../lib/useDebouncedSearch';
import { visitorFilters, VisitorView } from '../persistence';
import { Person } from '../../../features/visitors';
import { listVisitors } from '../../../repositories/people';
import { VISITOR_QUEUE_STATUSES } from '../../../types/person';

const PAGE_SIZE = 10;

export function useVisitors() {
  const query = useQuery(queryKeys.visitors, listVisitors);
  const rows = query.data ?? [];
  const [page, setPage] = useState(1);

  const [saved] = useState(() => visitorFilters.load() ?? {});
  const { search, setSearch: setSearchState, debouncedSearch } = useDebouncedSearch(saved.search ?? '');
  const [view, setViewState] = useState<VisitorView>(saved.view ?? 'queue');
  const [statusFilter, setStatusFilterState] = useState<Person['status'][]>(() =>
    (saved.statusFilter ?? []).filter((status) => VISITOR_QUEUE_STATUSES.includes(status)),
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
  const queue = rows.filter((person) => VISITOR_QUEUE_STATUSES.includes(person.status));
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
