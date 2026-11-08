// Local
import { getPersonSensitive } from '../repositories/personSensitive';
import { useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';
import { listMemberBirthdays } from '../repositories/birthdays';

export const usePersonSensitive = (personId: string, enabled = true) =>
  useQuery(queryKeys.personSensitive(personId), () => getPersonSensitive(personId), { enabled: enabled && !!personId });

export const useMemberBirthdays = () => useQuery(queryKeys.memberBirthdays, listMemberBirthdays);
