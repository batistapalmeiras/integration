// Local
import { encodePathFilters, ListFilters, PathFilter, slugTable } from '../../lib/pathFilters';
import { AppRoute } from '../../routes/paths';
import { storedValue } from '../../lib/storage';
import { STATUS_LABELS, VISITOR_QUEUE_STATUSES } from '../../types/person';

export type VisitorFilterKey = 'status';

export const VISITOR_FILTERS: PathFilter<VisitorFilterKey>[] = [
  { key: 'status', slugs: slugTable(STATUS_LABELS, VISITOR_QUEUE_STATUSES) },
];

export const visitorsPath = (filters: ListFilters<VisitorFilterKey>): string =>
  [AppRoute.Visitors, ...encodePathFilters(VISITOR_FILTERS, filters)].join('/');

export const visitorFilters = storedValue<ListFilters<VisitorFilterKey>>('visitors-list-filters');
