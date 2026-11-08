// React
import { useMemo } from 'react';
// Local
import { coffeeHistory } from '../../../domain/cafeSchedule';
import { fetchCoffeeHistoryBoard } from '../../../repositories/cafeSchedule';
import { todayKey } from '../../../domain/dates';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';

export function useCoffeeHistory() {
  const query = useQuery(queryKeys.coffeeHistory, fetchCoffeeHistoryBoard);
  const events = useMemo(() => (query.data ? coffeeHistory(query.data, todayKey()) : []), [query.data]);
  return { events, loading: query.loading, error: errorMessage(query.error) };
}
