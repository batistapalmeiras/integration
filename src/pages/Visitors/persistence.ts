// Local
import { VisitorQueue } from '../../features/visitors';

const STORAGE_KEY = 'visitors-filters';

export type QueueFilter = 'all' | VisitorQueue;

export interface VisitorFilters {
  search: string;
  queue: QueueFilter;
}

export function loadSavedFilters(): Partial<VisitorFilters> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<VisitorFilters>;
  } catch {
    return null;
  }
}

export function saveFilters(filters: VisitorFilters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
  }
}
