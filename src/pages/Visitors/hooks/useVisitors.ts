// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { pickFrom, useListParams } from '../../../lib/useListParams';
import { matchesNameOrPhone } from '../../../domain/search';
import { VISITOR_FILTERS, visitorFilters, VisitorView } from '../persistence';
import { Person } from '../../../features/visitors';
import { listVisitors } from '../../../repositories/people';
import { VISITOR_QUEUE_STATUSES } from '../../../types/person';
import { AppRoute } from '../../../routes/paths';

export function useVisitors() {
  const query = useQuery(queryKeys.visitors, listVisitors);
  const rows = query.data ?? [];
  const list = useListParams({ basePath: AppRoute.Visitors, filters: VISITOR_FILTERS, stored: visitorFilters });
  const view: VisitorView = list.filter('view').includes('archived') ? 'archived' : 'queue';
  const statusFilter = pickFrom(list.filter('status'), VISITOR_QUEUE_STATUSES);

  const queue = rows.filter((person) => VISITOR_QUEUE_STATUSES.includes(person.status));
  const archived = rows.filter((person) => person.status === 'archived');
  const filtered = (view === 'queue' ? queue : archived).filter(
    (person) =>
      matchesNameOrPhone(person, list.debouncedSearch) &&
      (view === 'archived' || statusFilter.length === 0 || statusFilter.includes(person.status)),
  );
  const { items, page, totalPages } = list.paginate(filtered);

  return {
    rows: items,
    totalCount: filtered.length,
    loading: query.loading,
    error: errorMessage(query.error),
    page,
    totalPages,
    setPage: list.setPage,
    search: list.search,
    setSearch: list.setSearch,
    view,
    setView: (value: VisitorView) => list.setFilter('view', value === 'archived' ? [value] : []),
    queueCount: queue.length,
    archivedCount: archived.length,
    statusFilter,
    setStatusFilter: (value: Person['status'][]) => list.setFilter('status', value),
    hasFilter: !!list.search.trim() || (view === 'queue' && statusFilter.length > 0),
  };
}
