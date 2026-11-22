// Local
import { storedValue } from '../../lib/storage';

export type MemberSort = 'name_asc' | 'name_desc';

export const MEMBER_SORT_OPTIONS: { value: MemberSort; label: string }[] = [
  { value: 'name_asc', label: 'Nome (A–Z)' },
  { value: 'name_desc', label: 'Nome (Z–A)' },
];

export const isMemberSort = (value: unknown): value is MemberSort =>
  MEMBER_SORT_OPTIONS.some((option) => option.value === value);

export const memberSortStore = storedValue<string>('members-sort');

export function sortByName<T>(items: T[], nameOf: (item: T) => string, sort: MemberSort): T[] {
  const direction = sort === 'name_asc' ? 1 : -1;
  return [...items].sort((a, b) => direction * nameOf(a).localeCompare(nameOf(b), 'pt-BR'));
}
