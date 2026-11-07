// Local
import { getPersonSensitive } from '../domain/personSensitive';
import { useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';

export const usePersonSensitive = (personId: string, enabled = true) =>
  useQuery(queryKeys.personSensitive(personId), () => getPersonSensitive(personId), { enabled: enabled && !!personId });
