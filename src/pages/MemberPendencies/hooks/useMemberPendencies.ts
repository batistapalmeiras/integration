// React
import { useState } from 'react';
// Local
import { PendencyField } from '../../../domain/memberRecords';
import { listMemberPendencies } from '../../../repositories/memberRecords';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { useDebouncedSearch } from '../../../lib/useDebouncedSearch';

const PAGE_SIZE = 10;

export function useMemberPendencies() {
  const [field, setFieldState] = useState<PendencyField | null>(null);
  const { search, setSearch: setSearchState, debouncedSearch } = useDebouncedSearch();
  const [page, setPage] = useState(1);

  const params = { field, search: debouncedSearch, page, pageSize: PAGE_SIZE };
  const query = useQuery(queryKeys.memberPendencies(params), () => listMemberPendencies(params));
  const total = query.data?.total ?? 0;

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };

  const setField = (value: PendencyField | null) => {
    setFieldState(value);
    setPage(1);
  };

  return {
    rows: query.data?.rows ?? [],
    total,
    loading: query.loading,
    error: errorMessage(query.error),
    field,
    setField,
    search,
    setSearch,
    page,
    setPage,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
