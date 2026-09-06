const STORAGE_KEY = 'coffee-filters';

export interface CoffeeFilters {
  search: string;
}

export function loadSavedFilters(): CoffeeFilters | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CoffeeFilters;
  } catch {
    return null;
  }
}

export function saveFilters(filters: CoffeeFilters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // localStorage unavailable (e.g. private mode) — persistence is best-effort
  }
}
