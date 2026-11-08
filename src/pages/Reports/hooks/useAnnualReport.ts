// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { AnnualCounts, listAnnualYears, loadAnnualCounts } from '../../../repositories/reports';

const EMPTY_COUNTS: AnnualCounts = {
  initialContact: 0,
  welcomeCoffee: 0,
  integration: 0,
  member: 0,
  archived: 0,
};

export function useAnnualYears() {
  return useQuery(queryKeys.annualYears, listAnnualYears).data ?? [new Date().getFullYear()];
}

export function useAnnualReport(year: number) {
  const query = useQuery(queryKeys.annualReport(year), () => loadAnnualCounts(year));
  return { counts: query.data ?? EMPTY_COUNTS, loading: query.loading, error: errorMessage(query.error) };
}
