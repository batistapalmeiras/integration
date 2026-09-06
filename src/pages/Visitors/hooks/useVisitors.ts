// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { comparePeopleByPipeline } from '../../../types/person';
import { Person } from '../types';

// This page is the "contact" stage queue: once a person moves past it
// (welcome_coffee onward) they belong to the next volunteer's stage and
// stop showing up here. Archived people stay visible since reactivating
// always sends them back into this same contact queue.
const VISIBLE_STATUSES: Person['status'][] = ['initial_contact', 'retry_contact', 'archived'];
const PAGE_SIZE = 10;

export function useVisitors() {
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('people').select('*').in('status', VISIBLE_STATUSES);

    if (loadError) {
      setError(loadError.message);
    } else {
      setAllPeople((data as Person[]).sort(comparePeopleByPipeline));
      setPage(1);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(allPeople.length / PAGE_SIZE));
  const people = allPeople.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { people, totalCount: allPeople.length, loading, error, page, totalPages, setPage };
}
