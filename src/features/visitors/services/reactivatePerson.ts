// Local
import { clearWhatsAppOpened, insertStatusHistory, updatePersonStatus } from '../infra/peopleRepository';
import { Person } from '../domain/types';

export async function reactivatePerson(person: Pick<Person, 'id' | 'status'>, actorId?: string): Promise<void> {
  await clearWhatsAppOpened(person.id);
  await updatePersonStatus(person.id, 'retry_contact');
  await insertStatusHistory({ personId: person.id, fromStatus: person.status, toStatus: 'retry_contact', changedBy: actorId });
}
