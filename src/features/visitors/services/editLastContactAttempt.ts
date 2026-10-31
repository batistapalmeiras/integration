// Local
import { statusAfterContact } from '../domain/contactAttempt';
import { ContactResult, Person } from '../domain/types';
import { insertStatusHistory, updateContactAttemptResult, updatePersonStatus } from '../infra/peopleRepository';
import { fieldsAfterContact, hasAttendedCoffee, placeAfterContact } from './contactFollowUp';

export async function editLastContactAttempt(
  person: Person,
  attemptId: string,
  result: ContactResult,
  actorId?: string,
): Promise<void> {
  await updateContactAttemptResult(attemptId, result);

  const toStatus = statusAfterContact(result, await hasAttendedCoffee(person.id));
  await updatePersonStatus(person.id, toStatus, { coffee_retry_used: false, ...fieldsAfterContact(toStatus) });
  await insertStatusHistory({
    personId: person.id,
    fromStatus: person.status,
    toStatus,
    changedBy: actorId,
    note: 'Correção do registro de contato anterior',
  });

  await placeAfterContact(person.id, toStatus);
}
