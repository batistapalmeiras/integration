// React
import { useCallback, useState } from 'react';

const columnsOf = (element: HTMLElement) =>
  getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length || 1;

export function fullRowsPageSize(columns: number, target: number): number {
  return columns * Math.ceil(target / columns);
}

export function useGridColumns(): [number, (element: HTMLElement | null) => void] {
  const [columns, setColumns] = useState(1);

  const ref = useCallback((element: HTMLElement | null) => {
    if (!element) return undefined;
    const update = () => setColumns(columnsOf(element));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [columns, ref];
}
