// Which turma a person belongs to, decided by the lesson calendar instead
// of by `status = 'active'`. Pure on purpose: every rule here is a date
// comparison the tests can pin down without touching the database.

// `lessons` only stores a date, and every class has always started at the
// same time, so the cutoff lives here instead of as a column nobody would
// ever fill in differently.
export const FIRST_LESSON_TIME = '17:30';

export interface LessonLike {
  number: number;
  date: string;
}

export interface CohortLike {
  lessons: LessonLike[];
}

export function firstLessonDate(lessons: LessonLike[]): string | null {
  const first = lessons.find((l) => l.number === 1) ?? [...lessons].sort((a, b) => a.number - b.number)[0];
  return first?.date ?? null;
}

export function firstLessonStart(date: string): Date {
  return new Date(`${date}T${FIRST_LESSON_TIME}:00`);
}

export function hasFirstLessonStarted(date: string, now: Date = new Date()): boolean {
  return now.getTime() >= firstLessonStart(date).getTime();
}

function byFirstLesson(a: CohortLike, b: CohortLike): number {
  return (firstLessonDate(a.lessons) ?? '').localeCompare(firstLessonDate(b.lessons) ?? '');
}

// The turma a new signup joins: the earliest one whose first class hasn't
// started yet. Same shape as the café, where someone new is attached to the
// next future event and never to the one that already happened — which is
// exactly what used to drop people into a turma already on its 3rd class.
export function selectUpcomingCohort<T extends CohortLike>(cohorts: T[], now: Date = new Date()): T | null {
  return (
    cohorts
      .filter((c) => {
        const date = firstLessonDate(c.lessons);
        return !!date && !hasFirstLessonStarted(date, now);
      })
      .sort(byFirstLesson)[0] ?? null
  );
}

// The turma that was open to someone who went to a café on `coffeeDate`:
// the first one starting on or after that café. Without a café date there's
// nothing to anchor to, so they follow whatever turma is still upcoming.
export function selectCohortForCoffee<T extends CohortLike>(
  cohorts: T[],
  coffeeDate: string | null,
  now: Date = new Date(),
): T | null {
  if (coffeeDate === null) return selectUpcomingCohort(cohorts, now) ?? [...cohorts].sort(byFirstLesson)[0] ?? null;

  return (
    cohorts
      .filter((c) => {
        const date = firstLessonDate(c.lessons);
        return !!date && date >= coffeeDate;
      })
      .sort(byFirstLesson)[0] ?? null
  );
}

export interface MissedSignupCandidate {
  personId: string;
  // Latest café the person actually attended, or null when no attendance
  // row survives for them at all.
  coffeeDate: string | null;
}

// Someone is only archived once the turma they could have joined has
// already started. No turma scheduled after their café means there was
// never anything to miss — they keep waiting, they don't get archived.
export function selectMissedSignups<T extends CohortLike>(
  candidates: MissedSignupCandidate[],
  cohorts: T[],
  now: Date = new Date(),
): string[] {
  return candidates
    .filter((candidate) => {
      const target = selectCohortForCoffee(cohorts, candidate.coffeeDate, now);
      const date = target && firstLessonDate(target.lessons);
      return !!date && hasFirstLessonStarted(date, now);
    })
    .map((c) => c.personId);
}

// A turma closes itself once its last class is behind us and nobody on its
// roster is still going through it. Both halves matter: a class everyone
// already finished shouldn't need a manual "Encerrar turma", and one whose
// students are still mid-process shouldn't disappear just because the
// calendar ran out.
export function isCohortFinished(lessons: LessonLike[], stillInIntegration: number, todayKey: string): boolean {
  if (lessons.length === 0) return false;
  const lastLesson = [...lessons].sort((a, b) => a.number - b.number).at(-1)!;
  return lastLesson.date < todayKey && stillInIntegration === 0;
}
