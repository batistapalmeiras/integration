// Local
import { MembershipStatus } from '../../domain/memberRecords';
import { EntryType } from '../../types/church';

const STORAGE_KEY = 'members-filters';

export interface MembersFilters {
  search: string;
  membershipStatusFilter: MembershipStatus[];
  entryTypeFilter: EntryType[];
}

export function loadSavedFilters(): Partial<MembersFilters> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<MembersFilters>;
  } catch {
    return null;
  }
}

export function saveFilters(filters: MembersFilters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
  }
}
