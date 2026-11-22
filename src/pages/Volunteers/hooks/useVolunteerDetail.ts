// Local
import { errorMessage, invalidateQueries, setQueryData, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { UserRole } from '../../../types/enums';
import { deleteVolunteer, getVolunteer, updateVolunteerRole } from '../../../repositories/volunteers';

export function useVolunteerDetail(id: string) {
  const query = useQuery(queryKeys.volunteer(id), () => getVolunteer(id), { enabled: !!id });

  const saveRole = async (role: UserRole) => {
    const updated = await updateVolunteerRole(id, role);
    setQueryData(queryKeys.volunteer(id), updated);
    invalidateQueries(queryKeys.volunteers, { refetchActive: false });
    invalidateQueries(queryKeys.personAccess(updated.personId), { refetchActive: false });
    invalidateQueries(queryKeys.personVolunteer(updated.personId), { refetchActive: false });
  };

  const removeVolunteer = async () => {
    await deleteVolunteer(id);
    await Promise.all([
      invalidateQueries(queryKeys.volunteers, { refetchActive: false }),
      invalidateQueries(queryKeys.volunteerCandidates, { refetchActive: false }),
      invalidateQueries(queryKeys.personAccess(query.data?.personId ?? ''), { refetchActive: false }),
      invalidateQueries(queryKeys.personVolunteer(query.data?.personId ?? '')),
    ]);
  };

  return {
    volunteer: query.data ?? null,
    loading: query.loading,
    error: errorMessage(query.error),
    saveRole,
    removeVolunteer,
  };
}
