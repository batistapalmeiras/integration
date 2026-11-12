// Local
import { ListFilters, PathFilter, slugTable } from '../../lib/pathFilters';
import { storedValue } from '../../lib/storage';
import { STATUS_LABELS, VISITOR_QUEUE_STATUSES } from '../../types/person';

export type VisitorFilterKey = 'status';

export const VISITOR_FILTERS: PathFilter<VisitorFilterKey>[] = [
  { key: 'status', slugs: slugTable(STATUS_LABELS, VISITOR_QUEUE_STATUSES) },
];

export const visitorFilters = storedValue<ListFilters<VisitorFilterKey>>('visitors-list-filters');
