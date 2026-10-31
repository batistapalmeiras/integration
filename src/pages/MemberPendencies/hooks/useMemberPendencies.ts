// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { listMemberPendencies, MemberPendency, PendencyField } from '../../../domain/memberRecords';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useMemberPendencies() {
  const [rows, setRows] = useState<MemberPendency[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [field, setFieldState] = useState<PendencyField | null>(null);
  const [search, setSearchState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listMemberPendencies({ field, search: debouncedSearch, page, pageSize: PAGE_SIZE });
      setRows(result.rows);
      setTotal(result.total);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  }, [field, debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };

  const setField = (value: PendencyField | null) => {
    setFieldState(value);
    setPage(1);
  };

  return {
    rows,
    total,
    loading,
    error,
    field,
    setField,
    search,
    setSearch,
    page,
    setPage,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
