// Local
import { attachToNextWelcomeCoffee } from '../../../domain/cafeSchedule';
import { resolveContactAttemptOutcome } from '../domain/contactAttempt';
import { ContactResult, Person } from '../domain/types';
import { clearWhatsAppOpened, insertContactAttempt, insertStatusHistory, updatePersonStatus } from '../infra/peopleRepository';

export async function registerContactAttempt(person: Person, result: ContactResult, actorId?: string): Promise<void> {
  await insertContactAttempt(person.id, result, actorId);

  const outcome = resolveContactAttemptOutcome(result, person.coffee_retry_used);

  if (outcome.clearWhatsAppOpened) {
    await clearWhatsAppOpened(person.id);
  }

  await updatePersonStatus(person.id, outcome.toStatus, { coffee_retry_used: false });
  await insertStatusHistory({
    personId: person.id,
    fromStatus: person.status,
    toStatus: outcome.toStatus,
    changedBy: actorId,
    note: outcome.noteOverride,
  });

  if (result === 'accepted') {
    await attachToNextWelcomeCoffee(person.id);
  }
}
