// Local
import { Person } from '../domain/types';
import { insertStatusHistory, updatePersonStatus } from '../infra/peopleRepository';

export async function confirmMember(
  person: Person,
  smallGroupId: string | null,
  ministryId: string | null,
  actorId?: string,
): Promise<void> {
  await updatePersonStatus(person.id, 'member', {
    small_group_id: smallGroupId,
    ministry_id: ministryId,
    membership_status: 'active',
  });
  await insertStatusHistory({
    personId: person.id,
    fromStatus: 'membership_pending',
    toStatus: 'member',
    changedBy: actorId,
  });
}
