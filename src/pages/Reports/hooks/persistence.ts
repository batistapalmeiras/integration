// Local
import { PersonStatus } from '../../../types/person';

const STORAGE_KEY = 'people-report-filters';

export interface PeopleFilters {
  statusFilter: PersonStatus[];
  cohortFilter: string;
  search: string;
}

export function loadSavedFilters(): PeopleFilters | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PeopleFilters;
  } catch {
    return null;
  }
}

export function saveFilters(filters: PeopleFilters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // localStorage unavailable (e.g. private mode) — persistence is best-effort
  }
}
