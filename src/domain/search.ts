const MIN_PHONE_DIGITS = 3;
const FILTER_SYNTAX = /[,()*%\\]/g;

export interface Searchable {
  name: string;
  phone?: string | null;
}

export function phoneDigits(search: string): string {
  const digits = search.replace(/\D/g, '');
  return digits.length >= MIN_PHONE_DIGITS ? digits : '';
}

export function matchesNameOrPhone(person: Searchable, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  const digits = phoneDigits(term);
  return person.name.toLowerCase().includes(term) || (!!digits && !!person.phone?.includes(digits));
}

export function nameFilter(search: string): string {
  return `name.ilike.%${search.trim().replace(FILTER_SYNTAX, ' ')}%`;
}

export function nameOrPhoneFilter(search: string): string {
  const digits = phoneDigits(search);
  return [nameFilter(search), ...(digits ? [`phone.ilike.%${digits}%`] : [])].join(',');
}
