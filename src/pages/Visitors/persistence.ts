// Local
import { PersonStatus } from '../../types/person';

const STORAGE_KEY = 'visitors-filters';

export interface VisitorFilters {
  search: string;
  statusFilter: PersonStatus[];
}

export function loadSavedFilters(): VisitorFilters | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisitorFilters;
  } catch {
    return null;
  }
}

export function saveFilters(filters: VisitorFilters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // localStorage unavailable (e.g. private mode) — persistence is best-effort
  }
}
