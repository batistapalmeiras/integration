// Local
import { useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';
import { getCouncilRoster, listCouncils } from '../repositories/councils';

export const useCouncils = (enabled = true) => useQuery(queryKeys.councils, listCouncils, { enabled });

export const useCouncilRoster = (id: string) =>
  useQuery(queryKeys.councilRoster(id), () => getCouncilRoster(id), { enabled: !!id });
