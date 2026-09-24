// Local
import { getActiveCohortWithLessons } from './classesRoster';
import { supabase } from '../lib/supabase';

// `lessons` only stores a date, and every class has always started at the
// same time, so the cutoff lives here instead of as a column nobody would
// ever fill in differently.
export const FIRST_LESSON_TIME = '17:30';

export function signupDeadlineFor(firstLessonDate: string): Date {
  return new Date(`${firstLessonDate}T${FIRST_LESSON_TIME}:00`);
}

export function isSignupDeadlinePast(firstLessonDate: string, now: Date = new Date()): boolean {
  return now.getTime() >= signupDeadlineFor(firstLessonDate).getTime();
}

export interface PendingSignupCandidate {
  personId: string;
  // Latest café the person actually attended, or null when no attendance
  // row survives for them at all.
  coffeeDate: string | null;
}

// Only people whose café happened BEFORE the first class had a chance to
// sign up for this turma — someone who attended a café *after* it already
// belongs to the next cycle, and archiving them would delete a brand new
// visitor the moment they got marked as present. A missing café date can't
// be placed in either cycle, so it falls to the deadline like everyone else.
export function selectMissedSignups(candidates: PendingSignupCandidate[], firstLessonDate: string): string[] {
  return candidates.filter((c) => c.coffeeDate === null || c.coffeeDate < firstLessonDate).map((c) => c.personId);
}

// Archives whoever attended the café, got the turma link and never filled it
// in by the time the first class started. Returns how many were archived.
export async function archiveMissedSignups(actorId?: string): Promise<number> {
  const active = await getActiveCohortWithLessons();
  const firstLesson = active?.lessons.find((l) => l.number === 1) ?? active?.lessons[0];
  if (!firstLesson || !isSignupDeadlinePast(firstLesson.date)) return 0;

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

  const missed = selectMissedSignups(
    pendingIds.map((id) => ({ personId: id, coffeeDate: latestCoffee.get(id) ?? null })),
    firstLesson.date,
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
