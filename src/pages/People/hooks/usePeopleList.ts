// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { pickFrom, useListParams } from '../../../lib/useListParams';
import { useCohortNames } from '../../../queries/reference';
import { INTEGRATION_STATUSES, PersonStatus } from '../../../types/person';
import { ALL_COHORTS, peopleFilters, peopleFiltersFor } from '../persistence';
import { listPeople } from '../../../repositories/people';
import { AppRoute } from '../../../routes/paths';

export function usePeopleList() {
  const cohortQuery = useCohortNames();
  const cohortNames = cohortQuery.data ?? [];
  const list = useListParams({ basePath: AppRoute.People, filters: peopleFiltersFor(cohortNames), stored: peopleFilters });
  const statusFilter = pickFrom(list.filter('status'), INTEGRATION_STATUSES);
  const cohortFilter = list.filter('cohort')[0] ?? ALL_COHORTS;

  const filters = { statusFilter, cohortFilter, search: list.debouncedSearch };
  const waitingForCohorts = list.unresolved && cohortQuery.loading;
  const query = useQuery(queryKeys.peopleList(filters), () => listPeople(filters), { enabled: !waitingForCohorts });
  const allPeople = query.data ?? [];
  const { items, page, totalPages } = list.paginate(allPeople);

  return {
    people: items,
    cohortNames,
    totalCount: allPeople.length,
    loading: query.loading || waitingForCohorts,
    error: errorMessage(query.error),
    statusFilter,
    cohortFilter,
    setFilters: (status: PersonStatus[], cohort: string) =>
      list.setFilters({ status, cohort: cohort === ALL_COHORTS ? [] : [cohort] }),
    search: list.search,
    setSearch: list.setSearch,
    page,
    totalPages,
    setPage: list.setPage,
    hasFilter: !!list.search.trim() || statusFilter.length > 0 || cohortFilter !== ALL_COHORTS,
  };
}
