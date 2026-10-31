// Local
import { CoffeeBoardAttendance, CoffeeBoardPerson, latestAttendedCoffeeByPerson } from './cafeSchedule';
import { CohortWithLessons } from './classesRoster';
import { selectMissedSignups } from './cohortSchedule';
import { supabase } from '../lib/supabase';

export function missedSignupIds(
  people: CoffeeBoardPerson[],
  attendance: CoffeeBoardAttendance[],
  cohorts: CohortWithLessons[],
): string[] {
  const pending = people.filter((p) => p.status === 'pending_signup');
  if (pending.length === 0) return [];

  const latestCoffee = latestAttendedCoffeeByPerson(attendance);
  return selectMissedSignups(
    pending.map((p) => ({ personId: p.id, coffeeDate: p.signup_window_from ?? latestCoffee.get(p.id) ?? null })),
    cohorts,
  );
}

export async function archivePeople(personIds: string[], actorId?: string): Promise<number> {
  if (personIds.length === 0) return 0;

  const { data: archived, error } = await supabase
    .from('people')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .in('id', personIds)
    .eq('status', 'pending_signup')
    .select('id');
  if (error) throw error;

  const archivedIds = (archived ?? []).map((p) => p.id as string);
  if (archivedIds.length === 0) return 0;

  await supabase.from('status_history').insert(
    archivedIds.map((personId) => ({
      person_id: personId,
      from_status: 'pending_signup',
      to_status: 'archived',
      changed_by: actorId ?? null,
      note: 'Não se inscreveu na turma até o início da primeira aula',
    })),
  );

  return archivedIds.length;
}
