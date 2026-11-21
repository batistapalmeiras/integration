// Local
import { Person } from '../../features/visitors';
import { storedValue } from '../../lib/storage';

export type ArchivedSort = 'name' | 'archived_desc' | 'archived_asc';

export const ARCHIVED_SORT_OPTIONS: { value: ArchivedSort; label: string }[] = [
  { value: 'name', label: 'Nome (A–Z)' },
  { value: 'archived_desc', label: 'Arquivados mais recentemente' },
  { value: 'archived_asc', label: 'Arquivados há mais tempo' },
];

export const isArchivedSort = (value: unknown): value is ArchivedSort =>
  ARCHIVED_SORT_OPTIONS.some((option) => option.value === value);

export const archivedSortStore = storedValue<string>('archived-visitors-sort');

export function sortArchived(people: Person[], dates: Record<string, string>, sort: ArchivedSort): Person[] {
  if (sort === 'name') return people;
  const direction = sort === 'archived_desc' ? -1 : 1;
  return [...people].sort(
    (a, b) => direction * (dates[a.id] ?? '').localeCompare(dates[b.id] ?? '') || a.name.localeCompare(b.name, 'pt-BR'),
  );
}
