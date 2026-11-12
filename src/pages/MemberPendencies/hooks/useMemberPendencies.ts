// Local
import { PENDENCY_LABELS } from '../../../domain/memberRecords';
import { listMemberPendencies } from '../../../repositories/memberRecords';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { PathFilter, slugTable } from '../../../lib/pathFilters';
import { LIST_PAGE_SIZE, pickKeys, useListParams } from '../../../lib/useListParams';
import { AppRoute } from '../../../routes/paths';

const FILTERS: PathFilter<'field'>[] = [{ key: 'field', slugs: slugTable(PENDENCY_LABELS) }];

export function useMemberPendencies() {
  const list = useListParams({ basePath: AppRoute.MemberPendencies, filters: FILTERS });
  const field = pickKeys(list.filter('field'), PENDENCY_LABELS)[0] ?? null;

  const params = { field, search: list.debouncedSearch, page: list.page, pageSize: LIST_PAGE_SIZE };
  const query = useQuery(queryKeys.memberPendencies(params), () => listMemberPendencies(params));
  const total = query.data?.total ?? 0;

  return {
    rows: query.data?.rows ?? [],
    total,
    loading: query.loading,
    error: errorMessage(query.error),
    field,
    setField: (value: string) => list.setFilter('field', value ? [value] : []),
    search: list.search,
    setSearch: list.setSearch,
    page: list.page,
    setPage: list.setPage,
    totalPages: Math.max(1, Math.ceil(total / LIST_PAGE_SIZE)),
  };
}
