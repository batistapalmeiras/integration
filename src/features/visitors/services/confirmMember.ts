// Local
import { setPersonMinistries } from '../../../repositories/communityGroups';
import { Person } from '../domain/types';
import { insertStatusHistory, updatePersonStatus } from '../../../repositories/people';

export interface MemberConfirmation {
  councilId: string;
  smallGroupId: string | null;
  ministryIds: string[];
}

export async function confirmMember(
  person: Person,
  { councilId, smallGroupId, ministryIds }: MemberConfirmation,
  actorId?: string,
): Promise<Person> {
  const updated = await updatePersonStatus(person.id, 'member', {
    small_group_id: smallGroupId,
    council_id: councilId,
  });
  await setPersonMinistries(person.id, ministryIds);
  await insertStatusHistory({
    personId: person.id,
    fromStatus: 'membership_pending',
    toStatus: 'member',
    changedBy: actorId,
  });
  return updated;
}
