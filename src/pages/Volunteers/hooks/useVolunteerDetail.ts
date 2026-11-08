// Local
import { errorMessage, invalidateQueries, setQueryData, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { UserRole } from '../../../types/enums';
import {
  deleteVolunteer,
  getVolunteer,
  getVolunteerEmail,
  updateVolunteer as saveVolunteer,
  updateVolunteerEmail,
  VolunteerRow,
} from '../../../repositories/volunteers';

export function useVolunteerDetail(id: string) {
  const volunteerQuery = useQuery(queryKeys.volunteer(id), () => getVolunteer(id), { enabled: !!id });
  const emailQuery = useQuery(queryKeys.volunteerEmail(id), () => getVolunteerEmail(id), { enabled: !!id });

  const updateProfile = async (fields: Partial<Pick<VolunteerRow, 'name' | 'role' | 'active'>>) => {
    setQueryData(queryKeys.volunteer(id), await saveVolunteer(id, fields));
    invalidateQueries(queryKeys.volunteers, { refetchActive: false });
  };

  const updateVolunteer = (name: string, role: UserRole) => updateProfile({ name, role });

  const updateEmail = async (newEmail: string) => {
    await updateVolunteerEmail(id, newEmail);
    setQueryData(queryKeys.volunteerEmail(id), newEmail);
  };

  const setActive = (active: boolean) => updateProfile({ active });

  const removeVolunteer = async () => {
    await deleteVolunteer(id);
    await invalidateQueries(queryKeys.volunteers, { refetchActive: false });
  };

  return {
    volunteer: volunteerQuery.data ?? null,
    email: emailQuery.data ?? null,
    loading: volunteerQuery.loading || emailQuery.loading,
    error: errorMessage(volunteerQuery.error),
    updateVolunteer,
    updateEmail,
    setActive,
    removeVolunteer,
  };
}
