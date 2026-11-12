// Local
import { ListFilters, PathFilter, slugify, slugTable } from '../../lib/pathFilters';
import { storedValue } from '../../lib/storage';
import { INTEGRATION_STATUSES, STATUS_LABELS } from '../../types/person';

export const ALL_COHORTS = 'all';

export type PeopleFilterKey = 'status' | 'cohort';

export const peopleFiltersFor = (cohortNames: string[]): PathFilter<PeopleFilterKey>[] => [
  { key: 'status', slugs: slugTable(STATUS_LABELS, INTEGRATION_STATUSES) },
  { key: 'cohort', slugs: Object.fromEntries(cohortNames.map((name) => [name, slugify(name)])) },
];

export const peopleFilters = storedValue<ListFilters<PeopleFilterKey>>('people-list-filters');
