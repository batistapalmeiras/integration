// React
import { useEffect, useState } from 'react';
// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { useCohortNames } from '../../../queries/reference';
import { comparePeopleByPipeline, INTEGRATION_STATUSES, PersonStatus } from '../../../types/person';
import { PersonReportRow } from '../types';
import { loadSavedFilters, saveFilters } from './persistence';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

interface ReportFilters {
  statusFilter: PersonStatus[];
  cohortFilter: string;
  search: string;
}

async function listReportPeople({ statusFilter, cohortFilter, search }: ReportFilters): Promise<PersonReportRow[]> {
  let cohortPersonIds: string[] | null = null;
  if (cohortFilter !== 'all') {
    const { data, error } = await supabase
      .from('enrollments')
      .select('person_id, cohort:cohorts!inner(name)')
      .eq('cohort.name', cohortFilter);
    if (error) throw error;
    cohortPersonIds = (data ?? []).map((r) => r.person_id as string);
    if (cohortPersonIds.length === 0) return [];
  }

  let query = supabase
    .from('people')
    .select('id,name,status,whatsapp_opened_at,class_invite_sent_at,membership_interest_sent_at')
    .in('status', statusFilter.length > 0 ? statusFilter : INTEGRATION_STATUSES);
  if (search) query = query.ilike('name', `%${search}%`);
  if (cohortPersonIds) query = query.in('id', cohortPersonIds);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((p) => ({
      id: p.id as string,
      name: p.name as string,
      status: p.status as PersonStatus,
      whatsapp_opened_at: p.whatsapp_opened_at as string | null,
      class_invite_sent_at: p.class_invite_sent_at as string | null,
      membership_interest_sent_at: p.membership_interest_sent_at as string | null,
    }))
    .sort(comparePeopleByPipeline);
}

export function usePeopleReport() {

  const [statusFilter, setStatusFilterState] = useState<PersonStatus[]>(() =>
    (loadSavedFilters()?.statusFilter ?? []).filter((status) => INTEGRATION_STATUSES.includes(status)),
  );
  const [cohortFilter, setCohortFilterState] = useState<string>(() => loadSavedFilters()?.cohortFilter ?? 'all');
  const [search, setSearchState] = useState(() => loadSavedFilters()?.search ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(() => (loadSavedFilters()?.search ?? '').trim());
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    saveFilters({ statusFilter, cohortFilter, search });
  }, [statusFilter, cohortFilter, search]);

  const filters = { statusFilter, cohortFilter, search: debouncedSearch };
  const query = useQuery(queryKeys.peopleReport(filters), () => listReportPeople(filters));
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
