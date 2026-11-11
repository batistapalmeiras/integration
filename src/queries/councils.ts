// Local
import { useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';
import { listCouncils } from '../repositories/councils';

export const useCouncils = (enabled = true) => useQuery(queryKeys.councils, listCouncils, { enabled });
