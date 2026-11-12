// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { pickFrom, useListParams } from '../../../lib/useListParams';
import { matchesNameOrPhone } from '../../../domain/search';
import { VISITOR_FILTERS, visitorFilters } from '../persistence';
import { Person } from '../../../features/visitors';
import { listVisitors } from '../../../repositories/people';
import { VISITOR_QUEUE_STATUSES } from '../../../types/person';
import { AppRoute } from '../../../routes/paths';

export function useVisitors() {
  const query = useQuery(queryKeys.visitors, listVisitors);
  const rows = query.data ?? [];
  const list = useListParams({ basePath: AppRoute.Visitors, filters: VISITOR_FILTERS, stored: visitorFilters });
  const statusFilter = pickFrom(list.filter('status'), VISITOR_QUEUE_STATUSES);

  const matchesSearch = (person: Person) => matchesNameOrPhone(person, list.debouncedSearch);
  const queue = rows.filter(
    (person) =>
      VISITOR_QUEUE_STATUSES.includes(person.status) &&
      matchesSearch(person) &&
      (statusFilter.length === 0 || statusFilter.includes(person.status)),
  );
  const archivedCount = rows.filter((person) => person.status === 'archived' && matchesSearch(person)).length;
  const { items, page, totalPages } = list.paginate(queue);

  return {
    rows: items,
    totalCount: queue.length,
    loading: query.loading,
    error: errorMessage(query.error),
    page,
    totalPages,
    setPage: list.setPage,
    search: list.search,
    setSearch: list.setSearch,
    archivedCount,
    statusFilter,
    setStatusFilter: (value: Person['status'][]) => list.setFilter('status', value),
    hasFilter: !!list.search.trim() || statusFilter.length > 0,
  };
}
