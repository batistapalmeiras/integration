// React
import { useState } from 'react';
// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { useListParams } from '../../../lib/useListParams';
import { matchesNameOrPhone } from '../../../domain/search';
import { listArchivedDates, listVisitors } from '../../../repositories/people';
import { AppRoute } from '../../../routes/paths';
import { ArchivedSort, archivedSortStore, isArchivedSort, sortArchived } from '../archivedSort';

export function useArchivedVisitors() {
  const query = useQuery(queryKeys.visitors, listVisitors);
  const datesQuery = useQuery(queryKeys.archivedDates, listArchivedDates);
  const list = useListParams({ basePath: AppRoute.ArchivedVisitors, filters: [] });
  const [sort, setSortState] = useState<ArchivedSort>(() => {
    const stored = archivedSortStore.load();
    return isArchivedSort(stored) ? stored : 'name';
  });
  const dates = datesQuery.data ?? {};

  const archived = sortArchived(
    (query.data ?? []).filter(
      (person) => person.status === 'archived' && matchesNameOrPhone(person, list.debouncedSearch),
    ),
    dates,
    sort,
  );
  const { items, page, totalPages } = list.paginate(archived);

  const setSort = (next: ArchivedSort) => {
    setSortState(next);
    archivedSortStore.save(next);
    if (page > 1) list.setPage(1);
  };

  return {
    rows: items,
    totalCount: archived.length,
    loading: query.loading || datesQuery.loading,
    error: errorMessage(query.error ?? datesQuery.error),
    page,
    totalPages,
    setPage: list.setPage,
    search: list.search,
    setSearch: list.setSearch,
    sort,
    setSort,
    hasFilter: !!list.search.trim(),
  };
}
