// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { AnnualCounts } from '../types';

const EMPTY_COUNTS: AnnualCounts = {
  initialContact: 0,
  welcomeCoffee: 0,
  integration: 0,
  member: 0,
  archived: 0,
};

export function useAnnualReport() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [counts, setCounts] = useState<AnnualCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadYears = async () => {
      const { data } = await supabase.from('people').select('created_at');
      const years = new Set((data ?? []).map((p) => new Date(p.created_at).getFullYear()));
      years.add(currentYear);
      setAvailableYears(Array.from(years).sort((a, b) => b - a));
    };
    loadYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const start = `${year}-01-01`;
    const end = `${year + 1}-01-01`;

    // 'initial_contact' is only ever the DB default status set at row
    // creation — no status_history row is ever written for entering it —
    // so this count has to come from people.created_at, not status_history.
    const { count: initialContactCount, error: peopleError } = await supabase
      .from('people')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', start)
      .lt('created_at', end);

    if (peopleError) {
      setError(peopleError.message);
      setLoading(false);
      return;
    }

    const { data: historyData, error: historyError } = await supabase
      .from('status_history')
      .select('to_status, created_at')
      .gte('created_at', start)
      .lt('created_at', end);

    if (historyError) {
      setError(historyError.message);
      setLoading(false);
      return;
    }

    const tally = { welcome_coffee: 0, integration: 0, member: 0, archived: 0 };
    for (const row of historyData ?? []) {
      if (row.to_status in tally) tally[row.to_status as keyof typeof tally] += 1;
    }

    setCounts({
      initialContact: initialContactCount ?? 0,
      welcomeCoffee: tally.welcome_coffee,
      integration: tally.integration,
      member: tally.member,
      archived: tally.archived,
    });
    setLoading(false);
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  return { year, setYear, availableYears, counts, loading, error };
}
