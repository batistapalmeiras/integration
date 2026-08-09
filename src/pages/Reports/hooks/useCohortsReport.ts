// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { CohortRow } from '../types';

export function useCohortsReport() {
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: cohortsData, error: cohortsError } = await supabase
      .from('cohorts')
      .select('*')
      .order('created_at', { ascending: false });

    if (cohortsError) {
      setError(cohortsError.message);
      setLoading(false);
      return;
    }

    const { data: enrollmentsData, error: enrollmentsError } = await supabase.from('enrollments').select('cohort_id');

    if (enrollmentsError) {
      setError(enrollmentsError.message);
      setLoading(false);
      return;
    }

    const countByCohort = new Map<string, number>();
    for (const enrollment of enrollmentsData ?? []) {
      countByCohort.set(enrollment.cohort_id, (countByCohort.get(enrollment.cohort_id) ?? 0) + 1);
    }

    setCohorts(
      (cohortsData ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        createdAt: c.created_at,
        enrollmentCount: countByCohort.get(c.id) ?? 0,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { cohorts, loading, error };
}
