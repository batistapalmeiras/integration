// Local
import { storedValue } from '../../../lib/storage';
import { PersonStatus } from '../../../types/person';

interface PeopleFilters {
  statusFilter: PersonStatus[];
  cohortFilter: string;
  search: string;
}

export const peopleReportFilters = storedValue<Partial<PeopleFilters>>('people-report-filters');
