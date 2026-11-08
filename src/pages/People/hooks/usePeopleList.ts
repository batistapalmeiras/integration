// React
import { useEffect, useState } from 'react';
// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { useDebouncedSearch } from '../../../lib/useDebouncedSearch';
import { useCohortNames } from '../../../queries/reference';
import { INTEGRATION_STATUSES, PersonStatus } from '../../../types/person';
import { peopleFilters } from '../persistence';
import { listPeople } from '../../../repositories/people';

const PAGE_SIZE = 10;

export function usePeopleList() {
  const [saved] = useState(() => peopleFilters.load() ?? {});
  const [statusFilter, setStatusFilterState] = useState<PersonStatus[]>(() =>
    (saved.statusFilter ?? []).filter((status) => INTEGRATION_STATUSES.includes(status)),
  );
  const [cohortFilter, setCohortFilterState] = useState<string>(saved.cohortFilter ?? 'all');
  const { search, setSearch: setSearchState, debouncedSearch } = useDebouncedSearch(saved.search ?? '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    peopleFilters.save({ statusFilter, cohortFilter, search });
  }, [statusFilter, cohortFilter, search]);

  const filters = { statusFilter, cohortFilter, search: debouncedSearch };
  const query = useQuery(queryKeys.peopleList(filters), () => listPeople(filters));
  const allPeople = query.data ?? [];
  const cohortNames = useCohortNames().data ?? [];

  const totalCount = allPeople.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const people = allPeople.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };

  const setStatusFilter = (value: PersonStatus[]) => {
    setStatusFilterState(value);
    setPage(1);
  };

  const setCohortFilter = (value: string) => {
    setCohortFilterState(value);
    setPage(1);
  };

  return {
    people,
    cohortNames,
    totalCount,
    loading: query.loading,
    error: errorMessage(query.error),
    statusFilter,
    setStatusFilter,
    cohortFilter,
    setCohortFilter,
    search,
    setSearch,
    page,
    totalPages,
    setPage,
    hasFilter: !!search.trim() || statusFilter.length > 0 || cohortFilter !== 'all',
  };
}
