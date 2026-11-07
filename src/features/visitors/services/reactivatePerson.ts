// Local
import { insertStatusHistory, updatePersonStatus } from '../infra/peopleRepository';
import { Person } from '../domain/types';

export async function reactivatePerson(person: Pick<Person, 'id' | 'status'>, actorId?: string): Promise<Person> {
  const updated = await updatePersonStatus(person.id, 'retry_contact', { whatsapp_opened_at: null });
  await insertStatusHistory({ personId: person.id, fromStatus: person.status, toStatus: 'retry_contact', changedBy: actorId });
  return updated;
}
