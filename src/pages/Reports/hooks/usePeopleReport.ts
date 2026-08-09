// React
import { useCallback, useEffect, useMemo, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { PersonStatus } from '../../../types/person';
import { PersonReportRow } from '../types';

const PAGE_SIZE = 10;

export function usePeopleReport() {
  const [allPeople, setAllPeople] = useState<PersonReportRow[]>([]);
  const [cohortNames, setCohortNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | PersonStatus>('all');
  const [cohortFilter, setCohortFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: peopleData, error: peopleError } = await supabase.from('people').select('id,name,status');
    if (peopleError) {
      setError(peopleError.message);
      setLoading(false);
      return;
    }

    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('person_id, cohort:cohorts(name)');

    if (enrollmentsError) {
      setError(enrollmentsError.message);
      setLoading(false);
      return;
    }

    const enrollments = (enrollmentsData ?? []) as unknown as { person_id: string; cohort: { name: string } }[];

    const cohortsByPerson = new Map<string, string[]>();
    for (const enrollment of enrollments) {
      const list = cohortsByPerson.get(enrollment.person_id) ?? [];
      list.push(enrollment.cohort.name);
      cohortsByPerson.set(enrollment.person_id, list);
    }

    setAllPeople(
      (peopleData ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status as PersonStatus,
        cohortNames: (cohortsByPerson.get(p.id) ?? []).join(', '),
      })),
    );
    setCohortNames(Array.from(new Set(enrollments.map((e) => e.cohort.name))).sort());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredPeople = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allPeople.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (cohortFilter !== 'all' && !p.cohortNames.split(', ').includes(cohortFilter)) return false;
      if (term && !p.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [allPeople, statusFilter, cohortFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPeople.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const people = filteredPeople.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value: 'all' | PersonStatus) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleCohortFilter = (value: string) => {
    setCohortFilter(value);
    setPage(1);
  };

  return {
    people,
    cohortNames,
    loading,
    error,
    statusFilter,
    setStatusFilter: handleStatusFilter,
    cohortFilter,
    setCohortFilter: handleCohortFilter,
    search,
    setSearch: handleSearch,
    page: safePage,
    totalPages,
    setPage,
    hasFilter: !!search.trim() || statusFilter !== 'all' || cohortFilter !== 'all',
  };
}
