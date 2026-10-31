// Local
import { setPersonMinistries } from '../../../domain/communityGroups';
import { Person } from '../domain/types';
import { insertStatusHistory, updatePersonStatus } from '../infra/peopleRepository';

export async function confirmMember(
  person: Person,
  smallGroupId: string | null,
  ministryIds: string[],
  actorId?: string,
): Promise<void> {
  await updatePersonStatus(person.id, 'member', { small_group_id: smallGroupId });
  await setPersonMinistries(person.id, ministryIds);
  await insertStatusHistory({
    personId: person.id,
    fromStatus: 'membership_pending',
    toStatus: 'member',
    changedBy: actorId,
  });
}
