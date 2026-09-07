// Local
import { PersonStatus } from '../domain/types';
import { insertStatusHistory, updatePersonStatus } from '../infra/peopleRepository';

// Being enrolled in a cohort (whether that happens automatically elsewhere
// in the pipeline, or by hand via the Turma page's "Adicionar") must be
// reflected in the person's own pipeline status — otherwise their profile
// keeps showing the previous stage while they're actually already in the
// turma.
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
