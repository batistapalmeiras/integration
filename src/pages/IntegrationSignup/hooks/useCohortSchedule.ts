// React
import { useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { CohortSchedule } from '../types';

export function useCohortSchedule() {
  const [schedule, setSchedule] = useState<CohortSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .rpc('get_active_cohort_schedule')
      .then(({ data }) => {
        const rows = (data as CohortSchedule[]) ?? [];
        setSchedule(rows[0] ?? null);
        setLoading(false);
      });
  }, []);

  return { schedule, loading };
}
