// Local
import { savePersonCommunity } from '../../../repositories/communityGroups';
import { Person } from '../domain/types';
import { insertStatusHistory, updatePersonStatus } from '../../../repositories/people';

export interface MemberConfirmation {
  councilId: string;
  smallGroupIds: string[];
  ministryIds: string[];
}

export async function confirmMember(
  person: Person,
  { councilId, smallGroupIds, ministryIds }: MemberConfirmation,
  actorId?: string,
): Promise<Person> {
  await updatePersonStatus(person.id, 'member', { council_id: councilId });
  const updated = await savePersonCommunity(person.id, smallGroupIds, ministryIds);
  await insertStatusHistory({
    personId: person.id,
    fromStatus: 'membership_pending',
    toStatus: 'member',
    changedBy: actorId,
  });
  return updated;
}
