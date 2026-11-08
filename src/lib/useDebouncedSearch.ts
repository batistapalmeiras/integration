// React
import { useEffect, useState } from 'react';

const SEARCH_DEBOUNCE_MS = 300;

export function useDebouncedSearch(initial = '') {
  const [search, setSearch] = useState(initial);
  const [debouncedSearch, setDebouncedSearch] = useState(initial.trim());

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  return { search, setSearch, debouncedSearch };
}
