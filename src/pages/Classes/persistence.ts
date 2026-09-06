const STORAGE_KEY = 'classes-filters';

export interface ClassesFilters {
  search: string;
}

export function loadSavedFilters(): ClassesFilters | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClassesFilters;
  } catch {
    return null;
  }
}

export function saveFilters(filters: ClassesFilters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // localStorage unavailable (e.g. private mode) — persistence is best-effort
  }
}
