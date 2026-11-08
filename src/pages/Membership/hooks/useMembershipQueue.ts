// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { listMembershipQueue } from '../../../repositories/membership';

export function useMembershipQueue() {
  const query = useQuery(queryKeys.membershipQueue, listMembershipQueue);
  return { rows: query.data ?? [], loading: query.loading, error: errorMessage(query.error) };
}
