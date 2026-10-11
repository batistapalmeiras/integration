// Local
import { PersonStatus } from '../domain/types';
import { insertStatusHistory, updatePersonStatus } from '../infra/peopleRepository';

export async function enrollInIntegrationClass(
  person: { id: string; status: PersonStatus },
  actorId?: string,
): Promise<void> {
  if (person.status === 'integration') return;

  await updatePersonStatus(person.id, 'integration');
  await insertStatusHistory({
    personId: person.id,
    fromStatus: person.status,
    toStatus: 'integration',
    changedBy: actorId,
  });
}
