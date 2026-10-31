// React
import { useEffect, useState } from 'react';
// Local
import { coffeeHistory, CoffeeHistoryEvent, fetchCoffeeBoard } from '../../../domain/cafeSchedule';
import { todayKey } from '../../../domain/dates';

export function useCoffeeHistory() {
  const [events, setEvents] = useState<CoffeeHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoffeeBoard()
      .then((board) => setEvents(coffeeHistory(board, todayKey())))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading, error };
}
