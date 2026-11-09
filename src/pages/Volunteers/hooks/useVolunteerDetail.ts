// Local
import { errorMessage, invalidateQueries, setQueryData, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { UserRole } from '../../../types/enums';
import {
  deleteVolunteer,
  getVolunteer,
  updateVolunteer,
  updateVolunteerIdentity,
  VolunteerIdentity,
  VolunteerRow,
} from '../../../repositories/volunteers';

export function useVolunteerDetail(id: string) {
  const query = useQuery(queryKeys.volunteer(id), () => getVolunteer(id), { enabled: !!id });

  const save = async (fields: Partial<Pick<VolunteerRow, 'role' | 'active'>>) => {
    setQueryData(queryKeys.volunteer(id), await updateVolunteer(id, fields));
    invalidateQueries(queryKeys.volunteers, { refetchActive: false });
  };

  const removeVolunteer = async () => {
    await deleteVolunteer(id);
    await Promise.all([
      invalidateQueries(queryKeys.volunteers, { refetchActive: false }),
      invalidateQueries(queryKeys.volunteerCandidates, { refetchActive: false }),
    ]);
  };

  return {
    volunteer: query.data ?? null,
    loading: query.loading,
    error: errorMessage(query.error),
    saveVolunteer: async (identity: VolunteerIdentity, role: UserRole) => {
      await updateVolunteerIdentity(id, identity);
      await save({ role });
    },
    setActive: (active: boolean) => save({ active }),
    removeVolunteer,
  };
}
