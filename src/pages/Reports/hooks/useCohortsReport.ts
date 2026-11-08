// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { listCohortsReport } from '../../../repositories/reports';

export function useCohortsReport() {
  const query = useQuery(queryKeys.cohortsReport, listCohortsReport);
  return { cohorts: query.data ?? [], loading: query.loading, error: errorMessage(query.error) };
}
