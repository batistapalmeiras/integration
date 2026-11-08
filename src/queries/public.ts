// Local
import { useQuery } from '../lib/queryCache';
import { queryKeys, REFERENCE_STALE_TIME } from '../lib/queryKeys';
import { getActiveCohortSchedule, listPublicMinistryNames, listPublicSmallGroups } from '../repositories/publicForms';

export const useActiveCohortSchedule = () => useQuery(queryKeys.publicCohortSchedule, getActiveCohortSchedule);

export const usePublicMinistryNames = () =>
  useQuery(queryKeys.publicMinistryNames, listPublicMinistryNames, { staleTime: REFERENCE_STALE_TIME });

export const usePublicSmallGroups = () =>
  useQuery(queryKeys.publicSmallGroups, listPublicSmallGroups, { staleTime: REFERENCE_STALE_TIME });
