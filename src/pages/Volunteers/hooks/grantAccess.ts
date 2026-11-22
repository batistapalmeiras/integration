// Local
import { defaultVolunteerPassword } from '../../../domain/volunteers';
import { invalidateQueries } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { createVolunteer } from '../../../repositories/volunteers';
import { UserRole } from '../../../types/enums';

export async function grantAccess(personId: string, role: UserRole): Promise<void> {
  await createVolunteer({ personId, password: defaultVolunteerPassword(), role });
  await Promise.all([
    invalidateQueries(queryKeys.volunteers),
    invalidateQueries(queryKeys.volunteerCandidates),
    invalidateQueries(queryKeys.personVolunteer(personId)),
    invalidateQueries(queryKeys.personAccess(personId)),
  ]);
}
