// Local
import { resolveContactAttemptOutcome } from '../domain/contactAttempt';
import { ContactResult, Person } from '../domain/types';
import { insertContactAttempt, insertStatusHistory, updatePersonStatus } from '../infra/peopleRepository';
import { fieldsAfterContact, hasAttendedCoffee, placeAfterContact } from './contactFollowUp';

export async function registerContactAttempt(person: Person, result: ContactResult, actorId?: string): Promise<Person> {
  await insertContactAttempt(person.id, result, actorId);

  const outcome = resolveContactAttemptOutcome(result, person.coffee_retry_used, await hasAttendedCoffee(person.id));

  const updated = await updatePersonStatus(person.id, outcome.toStatus, {
    coffee_retry_used: false,
    ...(outcome.clearWhatsAppOpened ? { whatsapp_opened_at: null } : {}),
    ...fieldsAfterContact(outcome.toStatus),
  });
  await insertStatusHistory({
    personId: person.id,
    fromStatus: person.status,
    toStatus: outcome.toStatus,
    changedBy: actorId,
    note: outcome.noteOverride,
  });

  await placeAfterContact(person.id, outcome.toStatus);
  return updated;
}
