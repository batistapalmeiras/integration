// Local
import { errorMessage, setQueryData, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { closeCohort as closeCohortRow } from '../../../repositories/classesRoster';
import { CohortRosterData, loadCohortRoster } from '../../../repositories/reports';

export function useCohortRoster(cohortId: string) {
  const query = useQuery(queryKeys.cohortRoster(cohortId), () => loadCohortRoster(cohortId), { enabled: !!cohortId });
  const cohort = query.data?.cohort ?? null;

  const closeCohort = async () => {
    if (!cohort) return;
    await closeCohortRow(cohort.id);
    setQueryData<CohortRosterData>(queryKeys.cohortRoster(cohortId), (current) => ({
      ...(current as CohortRosterData),
      cohort: { ...(current as CohortRosterData).cohort, status: 'closed' },
    }));
  };

  return {
    cohort,
    roster: query.data?.roster ?? [],
    loading: query.loading,
    error: errorMessage(query.error),
    closeCohort,
  };
}
