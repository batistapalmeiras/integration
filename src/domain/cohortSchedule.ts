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
  coffeeDate: string | null;
}

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

export function isCohortFinished(lessons: LessonLike[], stillInIntegration: number, todayKey: string): boolean {
  if (lessons.length === 0) return false;
  const lastLesson = [...lessons].sort((a, b) => a.number - b.number).at(-1)!;
  return lastLesson.date < todayKey && stillInIntegration === 0;
}
