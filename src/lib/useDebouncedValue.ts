// React
import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 300;

export function useDebouncedValue(value: string) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [value]);

  return debounced;
}
