// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { useQuery } from '../../lib/queryCache';
import { queryKeys } from '../../lib/queryKeys';
import { getMustChangePassword } from '../../repositories/profiles';

export function useMustChangePassword() {
  const { user } = useAuthCtx();
  const userId = user?.id ?? '';
  const query = useQuery(queryKeys.mustChangePassword(userId), () => getMustChangePassword(userId), {
    enabled: !!userId,
  });

  return {
    mustChange: query.data ?? false,
    loading: query.loading,
    failed: !!query.error,
    recheck: query.refetch,
  };
}
