// Local
import { attachToNextWelcomeCoffee } from '../../../domain/cafeSchedule';
import { resolveEditedContactStatus } from '../domain/contactAttempt';
import { ContactResult, Person } from '../domain/types';
import { insertStatusHistory, updateContactAttemptResult, updatePersonStatus } from '../infra/peopleRepository';

export async function editLastContactAttempt(
  person: Person,
  attemptId: string,
  result: ContactResult,
  actorId?: string,
): Promise<void> {
  await updateContactAttemptResult(attemptId, result);

  const toStatus = resolveEditedContactStatus(result);
  await updatePersonStatus(person.id, toStatus, { coffee_retry_used: false });
  await insertStatusHistory({
    personId: person.id,
    fromStatus: person.status,
    toStatus,
    changedBy: actorId,
    note: 'Correção do registro de contato anterior',
  });

  if (result === 'accepted') {
    await attachToNextWelcomeCoffee(person.id);
  }
}
