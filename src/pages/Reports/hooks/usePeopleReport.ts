// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { comparePeopleByPipeline, PersonStatus } from '../../../types/person';
import { PersonReportRow } from '../types';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function usePeopleReport() {
  const [people, setPeople] = useState<PersonReportRow[]>([]);
  const [cohortNames, setCohortNames] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilterState] = useState<PersonStatus[]>([]);
  const [cohortFilter, setCohortFilterState] = useState<string>('all');
  const [search, setSearchState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    supabase
      .from('cohorts')
      .select('name')
      .order('name')
      .then(({ data }) => setCohortNames((data ?? []).map((c) => c.name as string)));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Cohort filter is a many-to-many relation (enrollments), so it's
    // resolved to a set of person ids first, then applied as an `.in()` on
    // the main query below — keeps every filter (status, cohort, search)
    // and the pagination itself running in the database, not in the browser.
    let cohortPersonIds: string[] | null = null;
    if (cohortFilter !== 'all') {
      const { data, error: enrollError } = await supabase
        .from('enrollments')
        .select('person_id, cohort:cohorts!inner(name)')
        .eq('cohort.name', cohortFilter);
      if (enrollError) {
        setError(enrollError.message);
        setLoading(false);
        return;
      }
      cohortPersonIds = (data ?? []).map((r) => r.person_id as string);
      if (cohortPersonIds.length === 0) {
        setPeople([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
    }

    // Sorting by pipeline stage isn't a plain column order Postgres can do
    // for us via the query builder, so — this dataset being small (a single
    // church's integration pipeline, not thousands of rows) — fetch every
    // matching row, sort by pipeline here, then slice the page client-side.
    // A DB-level range() before this sort would only reorder within each
    // page instead of across the whole filtered list.
    let query = supabase.from('people').select('id,name,status,whatsapp_opened_at');
    if (statusFilter.length > 0) query = query.in('status', statusFilter);
    if (debouncedSearch) query = query.ilike('name', `%${debouncedSearch}%`);
    if (cohortPersonIds) query = query.in('id', cohortPersonIds);

    const { data: peopleData, error: peopleError } = await query;
    if (peopleError) {
      setError(peopleError.message);
      setLoading(false);
      return;
    }

    const sorted = (peopleData ?? [])
      .map((p) => ({
        id: p.id as string,
        name: p.name as string,
        status: p.status as PersonStatus,
        whatsapp_opened_at: p.whatsapp_opened_at as string | null,
      }))
      .sort(comparePeopleByPipeline);

    setTotalCount(sorted.length);
    setPeople(sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    setLoading(false);
  }, [statusFilter, cohortFilter, debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
    loading,
    error,
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
