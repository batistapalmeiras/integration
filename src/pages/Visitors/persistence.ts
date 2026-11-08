// Local
import { storedValue } from '../../lib/storage';
import { PersonStatus } from '../../types/person';

export type VisitorView = 'queue' | 'archived';

interface VisitorFilters {
  view: VisitorView;
  search: string;
  statusFilter: PersonStatus[];
}

export const visitorFilters = storedValue<Partial<VisitorFilters>>('visitors-filters');
