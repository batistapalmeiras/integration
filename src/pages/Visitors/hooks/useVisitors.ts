// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { Person } from '../types';

// This page is the "contact" stage queue: once a person moves past it
// (welcome_coffee onward) they belong to the next volunteer's stage and
// stop showing up here. Archived people stay visible since reactivating
// always sends them back into this same contact queue.
const VISIBLE_STATUSES: Person['status'][] = ['initial_contact', 'retry_contact', 'archived'];

export function useVisitors() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from('people')
      .select('*')
      .in('status', VISIBLE_STATUSES)
      .order('created_at', { ascending: false });

    if (loadError) setError(loadError.message);
    else setPeople(data as Person[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { people, loading, error };
}
