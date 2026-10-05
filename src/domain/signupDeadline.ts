// Local
import { listAllCohorts } from './classesRoster';
import { selectMissedSignups } from './cohortSchedule';
import { supabase } from '../lib/supabase';

// Archives whoever attended a café, got the turma link and never filled it
// in before the turma open to them started. Returns how many were archived.
export async function archiveMissedSignups(actorId?: string): Promise<number> {
  const { data: pending, error: pendingError } = await supabase
    .from('people')
    .select('id')
    .eq('status', 'pending_signup');
  if (pendingError) throw pendingError;

  const pendingIds = (pending ?? []).map((p) => p.id as string);
  if (pendingIds.length === 0) return 0;

  const { data: attendance, error: attendanceError } = await supabase
    .from('coffee_attendance')
    .select('person_id, attended, coffee_event:coffee_events(event_date)')
    .in('person_id', pendingIds);
  if (attendanceError) throw attendanceError;

  const rows = (attendance ?? []) as unknown as {
    person_id: string;
    attended: boolean;
    coffee_event: { event_date: string };
  }[];
  const latestCoffee = new Map<string, string>();
  for (const row of rows) {
    if (!row.attended) continue;
    const current = latestCoffee.get(row.person_id);
    if (!current || row.coffee_event.event_date > current) latestCoffee.set(row.person_id, row.coffee_event.event_date);
  }

  // Closed turmas count too: one that already ran is the clearest proof
  // that whoever was waiting on it missed their window.
  const missed = selectMissedSignups(
    pendingIds.map((id) => ({ personId: id, coffeeDate: latestCoffee.get(id) ?? null })),
    await listAllCohorts(),
  );
  if (missed.length === 0) return 0;

  // The status guard + `select()` is what keeps two sweeps racing (two
  // tabs, two volunteers opening Café at once) from logging the same
  // archive twice: the second update matches nothing and returns no rows.
  const { data: archived, error: archiveError } = await supabase
    .from('people')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .in('id', missed)
    .eq('status', 'pending_signup')
    .select('id');
  if (archiveError) throw archiveError;

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
