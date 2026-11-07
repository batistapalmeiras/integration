// React
import { useEffect, useState } from 'react';
// Local
import { listMemberPendencies, PendencyField } from '../../../domain/memberRecords';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useMemberPendencies() {
  const [field, setFieldState] = useState<PendencyField | null>(null);
  const [search, setSearchState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

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
