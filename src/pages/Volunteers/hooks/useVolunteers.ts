// Local
import { errorMessage, invalidateQueries, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { UserRole } from '../../../types/enums';
import { defaultVolunteerPassword } from '../../../domain/volunteers';
import { createVolunteer, listVolunteers, updateVolunteer } from '../../../repositories/volunteers';

export function useVolunteers() {
  const query = useQuery(queryKeys.volunteers, listVolunteers);

  const addVolunteer = async (personId: string, role: UserRole) => {
    await createVolunteer({ personId, password: defaultVolunteerPassword(), role });
    await Promise.all([invalidateQueries(queryKeys.volunteers), invalidateQueries(queryKeys.volunteerCandidates)]);
  };

  const changeRole = async (id: string, role: UserRole) => {
    await updateVolunteer(id, { role });
    await Promise.all([
      invalidateQueries(queryKeys.volunteers),
      invalidateQueries(queryKeys.volunteer(id), { refetchActive: false }),
    ]);
  };

  return {
    volunteers: query.data ?? [],
    loading: query.loading,
    error: errorMessage(query.error),
    addVolunteer,
    changeRole,
  };
}
