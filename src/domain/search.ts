// Local
import { foldText } from './text';

const MIN_PHONE_DIGITS = 3;

export interface Searchable {
  name: string;
  phone?: string | null;
}

function phoneDigits(search: string): string {
  const digits = search.replace(/\D/g, '');
  return digits.length >= MIN_PHONE_DIGITS ? digits : '';
}

export function matchesNameOrPhone(person: Searchable, search: string): boolean {
  const term = foldText(search.trim());
  if (!term) return true;
  const digits = phoneDigits(term);
  return foldText(person.name).includes(term) || (!!digits && !!person.phone?.includes(digits));
}
