// Local
import { errorMessage, invalidateQueries, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { UserRole } from '../../../types/enums';
import { listVolunteers, updateVolunteerRole } from '../../../repositories/volunteers';
import { grantAccess } from './grantAccess';

export function useVolunteers() {
  const query = useQuery(queryKeys.volunteers, listVolunteers);

  const changeRole = async (id: string, role: UserRole) => {
    await updateVolunteerRole(id, role);
    await Promise.all([
      invalidateQueries(queryKeys.volunteers),
      invalidateQueries(queryKeys.volunteer(id), { refetchActive: false }),
    ]);
  };

  return {
    volunteers: query.data ?? [],
    loading: query.loading,
    error: errorMessage(query.error),
    addVolunteer: grantAccess,
    changeRole,
  };
}
