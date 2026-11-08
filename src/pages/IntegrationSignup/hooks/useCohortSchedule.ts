// React
import { useEffect, useState } from 'react';
// Local
import { CohortSchedule, getActiveCohortSchedule } from '../../../repositories/publicForms';

export function useCohortSchedule() {
  const [schedule, setSchedule] = useState<CohortSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveCohortSchedule()
      .then(setSchedule)
      .catch(() => setSchedule(null))
      .finally(() => setLoading(false));
  }, []);

  return { schedule, loading };
}
