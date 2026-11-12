// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { useListParams } from '../../../lib/useListParams';
import { matchesNameOrPhone } from '../../../domain/search';
import { listVisitors } from '../../../repositories/people';
import { AppRoute } from '../../../routes/paths';

export function useArchivedVisitors() {
  const query = useQuery(queryKeys.visitors, listVisitors);
  const list = useListParams({ basePath: AppRoute.ArchivedVisitors, filters: [] });

  const archived = (query.data ?? []).filter(
    (person) => person.status === 'archived' && matchesNameOrPhone(person, list.debouncedSearch),
  );
  const { items, page, totalPages } = list.paginate(archived);

  return {
    rows: items,
    totalCount: archived.length,
    loading: query.loading,
    error: errorMessage(query.error),
    page,
    totalPages,
    setPage: list.setPage,
    search: list.search,
    setSearch: list.setSearch,
    hasFilter: !!list.search.trim(),
  };
}
